import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import Stripe from "stripe";

import { catalog, type CatalogOffering } from "../_data/offerings.catalog";
import { saveCheckout, type CheckoutItemSnapshot } from "../_data/checkout.store";

// Lunch Box backend logic 
import { validateLunchBox } from "../_validators/lunchbox";
import { calculateLunchBoxTotalCents } from "../_pricing/lunchbox";
// Eventos Masivos backend logic 
import { validateMassiveEvent } from "../_validators/masivos";
import { calculateMassiveEventTotalCents } from "../_pricing/masivos";

type ProviderId = "stripe" | "wompi";

/**
 * ✅ En backend: selection debe ser unknown para soportar múltiples shapes
 * (LunchBox tiene people.regular/vegetarian/restricted, otros usan people:number, etc.)
 */
type CheckoutItemDTO = {
  offeringId: string;
  quantity: number;
  selection: unknown;
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

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function getNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function isValidISODate(value: string): boolean {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

/**
 * ✅ Valida ítems “genéricos” (no LunchBox)
 * Solo aplica reglas basadas en offering.required, quantitySource, lead time, etc.
 */
function validateGenericItem(item: CheckoutItemDTO, offering: CatalogOffering, now: Date): string | null {
  if (item.quantity <= 0) return "Invalid quantity.";

  if (offering.type === "QUOTE_SERVICE" || offering.pricing.kind === "QUOTE") {
    return `Offering "${offering.title}" requires quote; checkout not allowed.`;
  }

  const required = offering.required ?? [];
  const sel = isObject(item.selection) ? item.selection : {};

  if (required.includes("VARIANT")) {
    const variantId = getString(sel.variantId);
    if (!variantId || variantId.trim().length === 0) return `Missing variant for "${offering.title}".`;
  }

  if (required.includes("PEOPLE")) {
    const p = getNumber(sel.people);
    if (p === null || p <= 0) return `Missing/invalid people for "${offering.title}".`;
  }

  if (required.includes("DATE")) {
    const dateISO = getString(sel.dateISO);
    if (!dateISO || !isValidISODate(dateISO)) return `Missing/invalid date for "${offering.title}".`;

    const lead = offering.minLeadTimeHours ?? 0;
    if (lead > 0) {
      const min = new Date(now.getTime() + lead * 60 * 60 * 1000);
      if (new Date(dateISO) < min) return `"${offering.title}" requires minimum ${lead}h lead time.`;
    }
  }

  if (required.includes("ADDRESS")) {
    const addr = getString(sel.address);
    if (!addr || addr.trim().length === 0) return `Missing address for "${offering.title}".`;
  }

  return null;
}

/**
 * ✅ Para offerings “normales”: quantitySource=PEOPLE usa selection.people:number
 * ✅ Para LunchBox: la cantidad “people” vive dentro de selection (no en quantity),
 *    así que tratamos quantity como “número de pedidos” (normalmente 1)
 */
function resolveBaseQuantity(item: CheckoutItemDTO, offering: CatalogOffering): number {
  if (offering.quantitySource === "PEOPLE") {
    const sel = isObject(item.selection) ? item.selection : {};
    const p = getNumber(sel.people);
    return p && p > 0 ? Math.floor(p) : 1;
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
    const sel = isObject(item.selection) ? item.selection : {};
    const variantId = getString(sel.variantId);
    if (!variantId) return null;
    return pricing.variants[variantId] ?? null;
  }

  return null;
}

async function createStripeSession(items: CheckoutItemDTO[], siteUrl: string): Promise<CreateCheckoutSessionResponse> {
  const now = new Date();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const metadata: Record<string, string> = {};

  for (const item of items) {
    const offering = catalogById[item.offeringId];
    if (!offering) throw new Error(`Offering not found: ${item.offeringId}`);

    // ⚠️ Si es LunchBox, Stripe no está integrado todavía con pricing dinámico
    // (si lo quieres con Stripe, hay que crear Price “custom_amount” o PaymentIntent server-side)
    if (offering.id === "lunch-box") {
      throw new Error('LunchBox requires dynamic pricing; use Wompi flow for now.');
    }

    const err = validateGenericItem(item, offering, now);
    if (err) throw new Error(err);

    const basePriceId = resolveStripeBasePriceId(item, offering);
    if (!basePriceId) throw new Error(`Could not resolve Stripe base price for: ${offering.title}`);

    const baseQty = resolveBaseQuantity(item, offering);
    line_items.push({ price: basePriceId, quantity: baseQty });

    const sel = isObject(item.selection) ? item.selection : {};
    const addonIds = (Array.isArray(sel.addonIds) ? sel.addonIds : []) as unknown[];

    if (addonIds.length > 0 && offering.addons) {
      for (const addonIdRaw of addonIds) {
        const addonId = typeof addonIdRaw === "string" ? addonIdRaw : null;
        if (!addonId) throw new Error(`Invalid addon id for "${offering.title}".`);

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
function wompiSignature(reference: string, amountInCents: number, currency: "COP", integritySecret: string) {
  const raw = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function resolveWompiBaseAmount(item: CheckoutItemDTO, offering: CatalogOffering): number | null {
  const p = offering.wompiPricing;
  if (!p) return null;

  if (p.kind === "AMOUNT") return p.amountInCents;

  if (p.kind === "VARIANTS") {
    const sel = isObject(item.selection) ? item.selection : {};
    const variantId = getString(sel.variantId);
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
  const redirectUrl = `${params.siteUrl}/checkout/wompi-result`;

  const url = new URL(`${params.siteUrl}/pay/wompi`);
  url.searchParams.set("publicKey", params.publicKey);
  url.searchParams.set("currency", currency);
  url.searchParams.set("amountInCents", String(params.amountInCents));
  url.searchParams.set("reference", params.reference);
  url.searchParams.set("signature", signature);
  url.searchParams.set("redirectUrl", redirectUrl);

  return url.toString();
}

/**
 * ✅ Total seguro para Wompi:
 * - Si offering === lunch-box => usa validator + pricing backend
 * - Si no => usa config wompiPricing y addons como antes
 */
function computeWompiTotalAmountAndSnapshot(items: CheckoutItemDTO[]) {
  const now = new Date();
  let total = 0;

  const snapshot: CheckoutItemSnapshot[] = [];

  for (const item of items) {
    const offering = catalogById[item.offeringId];
    if (!offering) throw new Error(`Offering not found: ${item.offeringId}`);

    // 1) LunchBox
    if (offering.id === "lunch-box") {
      // validator debe aceptar unknown y devolver value tipado
      const v = validateLunchBox(item.selection);
      if (!v.ok) throw new Error(v.error);

      const pricing = calculateLunchBoxTotalCents(v.value); 
      const unitTotalCents = pricing.totalCents // total del pedido

      const qty = Math.max(1, Math.floor(item.quantity)); // normalmente 1
      total += unitTotalCents * qty;

      snapshot.push({
        offeringId: offering.id,
        title: offering.title,
        quantity: qty,
        unitPriceCents: unitTotalCents,
        selection: v.value,
      });

      continue;
    }
    // 2) 
    if (offering.id === "eventos-masivos") {
      const v = validateMassiveEvent(item.selection);
      if (!v.ok) throw new Error(v.error);

      const pricing = calculateMassiveEventTotalCents(v.value);
      const unitTotalCents = pricing.totalCents;

      const qty = Math.max(1, Math.floor(item.quantity)); // normalmente 1
      total += unitTotalCents * qty;

      snapshot.push({
        offeringId: offering.id,
        title: offering.title,
        quantity: qty,
        unitPriceCents: unitTotalCents,
        selection: v.value,
      });

      continue;
    }

    // 2) Otros offerings: reglas genéricas + config wompiPricing
    const err = validateGenericItem(item, offering, now);
    if (err) throw new Error(err);

    const baseAmount = resolveWompiBaseAmount(item, offering);
    if (baseAmount === null) throw new Error(`Wompi amount not configured for offering: ${offering.title}`);

    const baseQty = resolveBaseQuantity(item, offering);
    const baseLine = baseAmount * baseQty;
    total += baseLine;

    // addons
    const sel = isObject(item.selection) ? item.selection : {};
    const addonIdsRaw = Array.isArray(sel.addonIds) ? sel.addonIds : [];
    for (const addonIdRaw of addonIdsRaw) {
      const addonId = typeof addonIdRaw === "string" ? addonIdRaw : null;
      if (!addonId) throw new Error(`Invalid addon id for "${offering.title}".`);

      const addonAmount = resolveWompiAddonAmount(offering, addonId);
      if (addonAmount === null) throw new Error(`Wompi addon not configured: ${addonId} for ${offering.title}`);
      total += addonAmount;
    }

    snapshot.push({
      offeringId: offering.id,
      title: offering.title,
      quantity: baseQty,
      unitPriceCents: baseAmount,
      selection: item.selection,
    });
  }

  return { totalAmountCents: total, itemsSnapshot: snapshot };
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
      const publicKey = process.env.WOMPI_PUBLIC_KEY;
      const integritySecret = process.env.WOMPI_INTEGRITY_KEY; // (si lo tienes como SECRET, cambia aquí)

      if (!publicKey || !integritySecret) {
        return res
          .status(501)
          .send("Wompi is not configured. Set WOMPI_PUBLIC_KEY and WOMPI_INTEGRITY_KEY env vars.");
      }

      const { totalAmountCents, itemsSnapshot } = computeWompiTotalAmountAndSnapshot(body.items);

      if (totalAmountCents <= 0) return badRequest(res, "Invalid total amount.");

      const reference = `MGF-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      // ✅ Guardamos checkout con total seguro + snapshot
      saveCheckout({
        reference,
        provider: "wompi",
        items: itemsSnapshot, // ahora incluye title/unitPriceCents reales
        totalAmountCents,
        createdAtISO: new Date().toISOString(),
      });

      const url = createWompiRedirectUrl({
        siteUrl,
        publicKey,
        integritySecret,
        reference,
        amountInCents: totalAmountCents,
      });

      return res.status(200).json({ url } satisfies CreateCheckoutSessionResponse);
    }

    return badRequest(res, "Invalid provider.");
  } catch (e) {
    console.error(e);
    return res.status(500).send(e instanceof Error ? e.message : "Internal Server Error");
  }
}
