import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import Stripe from "stripe";

import { catalog, type CatalogOffering } from "../_data/offerings.catalog";

type ProviderId = "stripe" | "wompi";

type OfferingSelection = {
  offeringId: string;
  variantId?: string;
  addonIds?: string[];
  people?: number;
  dateISO?: string;
  address?: string;
  notes?: string;
};

type CheckoutItemDTO = {
  offeringId: string;
  quantity: number;
  selection: OfferingSelection;
};

type CreateCheckoutSessionRequest = {
  provider: ProviderId;
  items: CheckoutItemDTO[];
};

type CreateCheckoutSessionResponse = { url: string };

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).send(msg);
}

function indexCatalog(items: CatalogOffering[]) {
  const byId: Record<string, CatalogOffering> = {};
  for (const o of items) byId[o.id] = o;
  return byId;
}
const catalogById = indexCatalog(catalog);

function isValidISODate(value: string): boolean {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function validateItem(item: CheckoutItemDTO, offering: CatalogOffering, now: Date): string | null {
  if (item.quantity <= 0) return "Invalid quantity.";

  if (offering.type === "QUOTE_SERVICE" || offering.pricing.kind === "QUOTE") {
    return `Offering "${offering.title}" requires quote; checkout not allowed.`;
  }

  const required = offering.required ?? [];

  if (required.includes("VARIANT")) {
    if (!item.selection.variantId || item.selection.variantId.trim().length === 0) {
      return `Missing variant for "${offering.title}".`;
    }
  }

  if (required.includes("PEOPLE")) {
    const p = item.selection.people;
    if (typeof p !== "number" || !Number.isFinite(p) || p <= 0) {
      return `Missing/invalid people for "${offering.title}".`;
    }
  }

  if (required.includes("DATE")) {
    const dateISO = item.selection.dateISO;
    if (!dateISO || !isValidISODate(dateISO)) {
      return `Missing/invalid date for "${offering.title}".`;
    }
    const lead = offering.minLeadTimeHours ?? 0;
    if (lead > 0) {
      const min = new Date(now.getTime() + lead * 60 * 60 * 1000);
      if (new Date(dateISO) < min) {
        return `"${offering.title}" requires minimum ${lead}h lead time.`;
      }
    }
  }

  if (required.includes("ADDRESS")) {
    const addr = item.selection.address;
    if (!addr || addr.trim().length === 0) {
      return `Missing address for "${offering.title}".`;
    }
  }

  return null;
}

function resolveBaseQuantity(item: CheckoutItemDTO, offering: CatalogOffering): number {
  if (offering.quantitySource === "PEOPLE") {
    const p = item.selection.people;
    return typeof p === "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : 1;
  }
  return Math.max(1, Math.floor(item.quantity));
}

/* ---------------------------
   STRIPE
---------------------------- */
const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"));

function resolveStripeBasePriceId(item: CheckoutItemDTO, offering: CatalogOffering): string | null {
  const pricing = offering.pricing;
  if (pricing.kind === "STRIPE_PRICE") return pricing.stripePriceId;

  if (pricing.kind === "STRIPE_VARIANTS") {
    const variantId = item.selection.variantId;
    if (!variantId) return null;
    return pricing.variants[variantId] ?? null;
  }

  return null;
}

async function createStripeSession(
  items: CheckoutItemDTO[],
  siteUrl: string
): Promise<CreateCheckoutSessionResponse> {
  const now = new Date();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const metadata: Record<string, string> = {};

  for (const item of items) {
    const offering = catalogById[item.offeringId];
    if (!offering) throw new Error(`Offering not found: ${item.offeringId}`);

    const err = validateItem(item, offering, now);
    if (err) throw new Error(err);

    const basePriceId = resolveStripeBasePriceId(item, offering);
    if (!basePriceId) throw new Error(`Could not resolve Stripe base price for: ${offering.title}`);

    const baseQty = resolveBaseQuantity(item, offering);
    line_items.push({ price: basePriceId, quantity: baseQty });

    const addonIds = item.selection.addonIds ?? [];
    if (addonIds.length > 0 && offering.addons) {
      for (const addonId of addonIds) {
        const addonPriceId = offering.addons[addonId];
        if (!addonPriceId) throw new Error(`Invalid addon "${addonId}" for "${offering.title}".`);
        line_items.push({ price: addonPriceId, quantity: 1 });
      }
    }

    metadata[`item_${item.offeringId}`] = JSON.stringify({
      offeringId: item.offeringId,
      selection: item.selection,
      qty: item.quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    metadata,
  });

  if (!session.url) throw new Error("Stripe session URL missing.");
  return { url: session.url };
}

/* ---------------------------
   WOMPI
---------------------------- */
// Wompi signature formula: SHA256("<Reference><Amount><Currency><IntegritySecret>") :contentReference[oaicite:1]{index=1}
function wompiSignature(reference: string, amountInCents: number, currency: "COP", integritySecret: string) {
  const raw = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function resolveWompiBaseAmount(item: CheckoutItemDTO, offering: CatalogOffering): number | null {
  const p = offering.wompiPricing;
  if (!p) return null;

  if (p.kind === "AMOUNT") return p.amountInCents;

  if (p.kind === "VARIANTS") {
    const variantId = item.selection.variantId;
    if (!variantId) return null;
    return p.variants[variantId] ?? null;
  }

  return null;
}

function resolveWompiAddonAmount(offering: CatalogOffering, addonId: string): number | null {
  const map = offering.wompiAddons;
  if (!map) return null;
  return map[addonId] ?? null;
}

function computeWompiTotalAmount(items: CheckoutItemDTO[]): number {
  const now = new Date();
  let total = 0;

  for (const item of items) {
    const offering = catalogById[item.offeringId];
    if (!offering) throw new Error(`Offering not found: ${item.offeringId}`);

    const err = validateItem(item, offering, now);
    if (err) throw new Error(err);

    const baseAmount = resolveWompiBaseAmount(item, offering);
    if (baseAmount === null) {
      throw new Error(`Wompi amount not configured for offering: ${offering.title}`);
    }

    const baseQty = resolveBaseQuantity(item, offering);
    total += baseAmount * baseQty;

    const addonIds = item.selection.addonIds ?? [];
    for (const addonId of addonIds) {
      const addonAmount = resolveWompiAddonAmount(offering, addonId);
      if (addonAmount === null) throw new Error(`Wompi addon not configured: ${addonId} for ${offering.title}`);
      total += addonAmount; // addons qty 1 por ahora
    }
  }

  return total;
}

function createWompiRedirectUrl(params: {
  siteUrl: string;
  publicKey: string;
  integritySecret: string;
  reference: string;
  amountInCents: number;
  currency?: "COP";
}) {
  
  const currency = params.currency ?? "COP";
  
  const signature = wompiSignature(params.reference, params.amountInCents, currency, params.integritySecret);

  // Wompi permite redirect-url (te devuelve ?id=TRANSACTION_ID) :contentReference[oaicite:2]{index=2}
  const redirectUrl = `${params.siteUrl}/checkout/wompi-result`;

  // Vamos a redirigir a una ruta nuestra que abre el WidgetCheckout con widget.js
  // (así mantenemos "url" como contrato único)
  const url = new URL(`${params.siteUrl}/pay/wompi`);
  url.searchParams.set("publicKey", params.publicKey);
  url.searchParams.set("currency", currency);
  url.searchParams.set("amountInCents", String(params.amountInCents));
  url.searchParams.set("reference", params.reference);
  url.searchParams.set("signature", signature);
  url.searchParams.set("redirectUrl", redirectUrl);

  return url.toString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const body = req.body as CreateCheckoutSessionRequest;

    if (!body || !body.provider) return badRequest(res, "Missing provider.");
    if (!Array.isArray(body.items) || body.items.length === 0) return badRequest(res, "Empty cart.");

    const siteUrl = process.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000";

    if (body.provider === "stripe") {
      const out = await createStripeSession(body.items, siteUrl);
      return res.status(200).json(out);
    }

    if (body.provider === "wompi") {
      // ✅ Puedes dejar esto listo y enchufar llaves después.
      // Por ahora fallará con mensaje claro si no están.
      const publicKey = process.env.WOMPI_PUBLIC_KEY;
      const integritySecret = process.env.WOMPI_INTEGRITY_KEY;

      if (!publicKey || !integritySecret) {
        return res.status(501).send(
          "Wompi is not configured. Set WOMPI_PUBLIC_KEY and WOMPI_INTEGRITY_KEY env vars."
        );
      }

      const amountInCents = computeWompiTotalAmount(body.items);

      // Referencia única recomendada por Wompi :contentReference[oaicite:3]{index=3}
      const reference = `MGF-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      const url = createWompiRedirectUrl({
        siteUrl,
        publicKey,
        integritySecret,
        reference,
        amountInCents,
      });

      return res.status(200).json({ url } satisfies CreateCheckoutSessionResponse);
    }

    return badRequest(res, "Invalid provider.");
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error");
  }
}
