import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { catalog, type CatalogOffering } from "../_data/offerings.catalog";

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
  items: CheckoutItemDTO[];
};

type CreateCheckoutSessionResponse = {
  url: string;
};

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const stripe = new Stripe(getEnv("STRIPE_SECRET_KEY"));

function indexCatalog(items: CatalogOffering[]) {
  const byId: Record<string, CatalogOffering> = {};
  for (const o of items) byId[o.id] = o;
  return byId;
}

const catalogById = indexCatalog(catalog);

function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).send(msg);
}

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

function resolveBasePriceId(item: CheckoutItemDTO, offering: CatalogOffering): string | null {
  const pricing = offering.pricing;

  if (pricing.kind === "STRIPE_PRICE") return pricing.stripePriceId;

  if (pricing.kind === "STRIPE_VARIANTS") {
    const variantId = item.selection.variantId;
    if (!variantId) return null;
    return pricing.variants[variantId] ?? null;
  }

  return null;
}

function resolveBaseQuantity(item: CheckoutItemDTO, offering: CatalogOffering): number {
  if (offering.quantitySource === "PEOPLE") {
    const p = item.selection.people;
    return typeof p === "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : 1;
  }
  // ITEM_QTY
  return Math.max(1, Math.floor(item.quantity));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const body = req.body as CreateCheckoutSessionRequest;

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return badRequest(res, "Empty cart.");
    }

    const now = new Date();

    // Validación y construcción de line_items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const metadata: Record<string, string> = {};

    for (const item of body.items) {
      const offering = catalogById[item.offeringId];
      if (!offering) return badRequest(res, `Offering not found: ${item.offeringId}`);

      const err = validateItem(item, offering, now);
      if (err) return badRequest(res, err);

      const basePriceId = resolveBasePriceId(item, offering);
      if (!basePriceId) return badRequest(res, `Could not resolve base price for: ${offering.title}`);

      const baseQty = resolveBaseQuantity(item, offering);

      line_items.push({
        price: basePriceId,
        quantity: baseQty,
      });

      // Add-ons como line items adicionales
      const addonIds = item.selection.addonIds ?? [];
      if (addonIds.length > 0 && offering.addons) {
        for (const addonId of addonIds) {
          const addonPriceId = offering.addons[addonId];
          if (!addonPriceId) return badRequest(res, `Invalid addon "${addonId}" for "${offering.title}".`);

          line_items.push({
            price: addonPriceId,
            quantity: 1,
          });
        }
      }

      // Metadata mínima (ojo: Stripe metadata tiene límites)
      metadata[`item_${item.offeringId}`] = JSON.stringify({
        offeringId: item.offeringId,
        selection: item.selection,
        qty: item.quantity,
      });
    }

    const siteUrl = process.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata,
    });

    const url = session.url;
    if (!url) return res.status(500).send("Stripe session URL missing.");

    const response: CreateCheckoutSessionResponse = { url };
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error");
  }
}
