import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

import { catalog, type CatalogOffering } from "../_data/offerings.catalog";
import { saveCheckout, type CheckoutItemSnapshot } from "../_data/checkout.store";

/* -------------------------------------------------------
  Tipos del request (backend-safe)
-------------------------------------------------------- */
type ProviderId = "wompi";

type CheckoutItemDTO = {
  offeringId: string;
  quantity: number; // para estos servicios normalmente 1
  selection: unknown; // ✅ backend-safe
};

type CreateCheckoutSessionRequest = {
  provider: ProviderId;
  items: CheckoutItemDTO[];
};

type CreateCheckoutSessionResponse = { url: string };

/* -------------------------------------------------------
  Utils
-------------------------------------------------------- */
function badRequest(res: VercelResponse, msg: string) {
  return res.status(400).send(msg);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function getNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function isValidISODate(value: string): boolean {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function indexCatalog(items: CatalogOffering[]) {
  const byId: Record<string, CatalogOffering> = {};
  for (const o of items) byId[o.id] = o;
  return byId;
}
const catalogById = indexCatalog(catalog);

/* -------------------------------------------------------
  ServiceSelection (estandarizado) — backend replica
-------------------------------------------------------- */
type MenuId = "basic" | "standard" | "gourmet";
type DietRestriction = { label: string; qty: number };

type ServiceSelection = {
  menu: MenuId;
  people: {
    regular: number;
    vegetarian: number;
    restricted: DietRestriction[];
  };
  notes?: string;
  // si luego agregas dateISO/address aquí también, lo soportamos:
  dateISO?: string;
  address?: string;
};

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function parseServiceSelection(sel: unknown): ParseResult<ServiceSelection> {
  if (!isObject(sel)) return { ok: false, error: "selection must be an object." };

  const menu = getString(sel.menu);
  if (menu !== "basic" && menu !== "standard" && menu !== "gourmet") {
    return { ok: false, error: 'selection.menu must be "basic" | "standard" | "gourmet".' };
  }

  const peopleRaw = (sel as Record<string, unknown>).people;
  if (!isObject(peopleRaw)) return { ok: false, error: "selection.people must be an object." };

  const regular = getNumber(peopleRaw.regular);
  const vegetarian = getNumber(peopleRaw.vegetarian);
  const restrictedRaw = (peopleRaw as Record<string, unknown>).restricted;

  if (regular === null || vegetarian === null) {
    return { ok: false, error: "people.regular and people.vegetarian must be numbers." };
  }
  if (!Array.isArray(restrictedRaw)) {
    return { ok: false, error: "people.restricted must be an array." };
  }

  const restricted: DietRestriction[] = [];
  for (const r of restrictedRaw) {
    if (!isObject(r)) return { ok: false, error: "each restriction must be an object." };
    const label = getString(r.label);
    const qty = getNumber(r.qty);
    if (!label || label.trim().length === 0) return { ok: false, error: "restriction.label is required." };
    if (qty === null || qty <= 0) return { ok: false, error: "restriction.qty must be a positive number." };
    restricted.push({ label: label.trim(), qty: Math.floor(qty) });
  }

  const notes = getString(sel.notes) ?? undefined;
  const dateISO = getString(sel.dateISO) ?? undefined;
  const address = getString(sel.address) ?? undefined;

  return {
    ok: true,
    value: {
      menu,
      people: {
        regular: Math.floor(regular),
        vegetarian: Math.floor(vegetarian),
        restricted,
      },
      notes,
      dateISO,
      address,
    },
  };
}

/* -------------------------------------------------------
  Pricing para TIERED_PER_PERSON (backend)
-------------------------------------------------------- */
type TieredPricing = Extract<CatalogOffering["pricing"], { kind: "TIERED_PER_PERSON" }>;

function findTier(pricing: TieredPricing, totalPeople: number) {
  return pricing.tiers.find((t) => totalPeople >= t.minPeople && totalPeople <= t.maxPeople) ?? null;
}

function computeTotalPeople(sel: ServiceSelection) {
  const restrictedQty = sel.people.restricted.reduce((s, r) => s + r.qty, 0);
  return sel.people.regular + sel.people.vegetarian + restrictedQty;
}

function computeWaitersRequired(pricing: TieredPricing, totalPeople: number) {
  const { minWaiters, peoplePerWaiter } = pricing.staffing;

  if (peoplePerWaiter <= 0) return minWaiters;
  if (minWaiters === 0 && peoplePerWaiter >= 9999) return 0;

  const byRatio = Math.ceil(totalPeople / peoplePerWaiter);
  return Math.max(minWaiters, byRatio);
}

function priceTieredOffering(offering: CatalogOffering, sel: ServiceSelection): ParseResult<{
  totalPeople: number;
  unitPriceCents: number; // per person ya con menú
  baseSubtotalCents: number;
  vegExtraCents: number;
  restExtraCents: number;
  totalCents: number;
  waitersRequired: number;
}> {
  if (offering.pricing.kind !== "TIERED_PER_PERSON") {
    return { ok: false, error: `Offering "${offering.title}" is not tiered.` };
  }

  const p = offering.pricing;

  const totalPeople = computeTotalPeople(sel);
  const minP = p.constraints.minPeople;
  const maxP = p.constraints.maxPeople;

  if (totalPeople < minP || totalPeople > maxP) {
    return { ok: false, error: `Total people must be between ${minP} and ${maxP}.` };
  }

  if (sel.people.regular < 0 || sel.people.vegetarian < 0) {
    return { ok: false, error: "People counts cannot be negative." };
  }

  const maxTypes = p.constraints.maxRestrictionTypes;
  if (sel.people.restricted.length > maxTypes) {
    return { ok: false, error: `Max restriction types exceeded (${maxTypes}).` };
  }

  const tier = findTier(p, totalPeople);
  if (!tier) return { ok: false, error: "No tier found for total people." };

  const menuCfg = p.menus[sel.menu];
  if (!menuCfg) return { ok: false, error: "Invalid menu." };

  // unit price per person (tier base) * menu multiplier
  const unitPriceCents = Math.round(tier.unitPriceCents * menuCfg.multiplier);

  const baseSubtotalCents = totalPeople * unitPriceCents;

  const vegExtraCents = sel.people.vegetarian * p.surcharges.vegetarianPerPersonCents;

  const restrictedQty = sel.people.restricted.reduce((s, r) => s + r.qty, 0);
  const restExtraCents = restrictedQty * p.surcharges.restrictionPerPersonCents;

  const totalCents = baseSubtotalCents + vegExtraCents + restExtraCents;

  const waitersRequired = computeWaitersRequired(p, totalPeople);

  return {
    ok: true,
    value: {
      totalPeople,
      unitPriceCents,
      baseSubtotalCents,
      vegExtraCents,
      restExtraCents,
      totalCents,
      waitersRequired,
    },
  };
}

/* -------------------------------------------------------
  Validaciones genéricas del offering (DATE/ADDRESS)
-------------------------------------------------------- */
function validateOfferingRequirements(offering: CatalogOffering, sel: ServiceSelection, now: Date): string | null {
  const required = offering.required ?? [];

  if (required.includes("DATE")) {
    const dateISO = sel.dateISO;
    if (!dateISO || !isValidISODate(dateISO)) return `Missing/invalid date for "${offering.title}".`;

    const lead = offering.minLeadTimeHours ?? 0;
    if (lead > 0) {
      const min = new Date(now.getTime() + lead * 60 * 60 * 1000);
      if (new Date(dateISO) < min) return `"${offering.title}" requires minimum ${lead}h lead time.`;
    }
  }

  if (required.includes("ADDRESS")) {
    const addr = sel.address;
    if (!addr || addr.trim().length === 0) return `Missing address for "${offering.title}".`;
  }

  return null;
}

/* -------------------------------------------------------
  WOMPI: firma + URL (pagas total de una vez)
-------------------------------------------------------- */
function wompiSignature(reference: string, amountInCents: number, currency: "COP", integritySecret: string) {
  const raw = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
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

/* -------------------------------------------------------
  Main: compute total + snapshot (solo tiered por ahora)
-------------------------------------------------------- */
function computeTotalAndSnapshot(items: CheckoutItemDTO[]) {
  const now = new Date();
  let total = 0;

  const snapshot: CheckoutItemSnapshot[] = [];

  for (const item of items) {
    const offering = catalogById[item.offeringId];
    if (!offering) throw new Error(`Offering not found: ${item.offeringId}`);

    if (offering.type === "QUOTE_SERVICE" || offering.pricing.kind === "QUOTE") {
      throw new Error(`Offering "${offering.title}" requires quote; checkout not allowed.`);
    }

    // solo cobramos “total del servicio” (qty normalmente 1)
    const qty = Math.max(1, Math.floor(item.quantity));

    // ✅ soportamos TIERED_PER_PERSON con selection estandarizado
    if (offering.pricing.kind === "TIERED_PER_PERSON") {
      const parsed = parseServiceSelection(item.selection);
      if (!parsed.ok) throw new Error(parsed.error);

      const reqErr = validateOfferingRequirements(offering, parsed.value, now);
      if (reqErr) throw new Error(reqErr);

      const priced = priceTieredOffering(offering, parsed.value);
      if (!priced.ok) throw new Error(priced.error);

      const unitTotalCents = priced.value.totalCents; // “total del pedido” (no per-person)
      const lineTotal = unitTotalCents * qty;

      total += lineTotal;

      snapshot.push({
        offeringId: offering.id,
        title: offering.title,
        quantity: qty,
        unitPriceCents: unitTotalCents,
        selection: parsed.value, // guardamos el selection tipado (pero snapshot usa unknown)
      });

      continue;
    }

    // Si aún tienes cosas legacy con wompiPricing fijo, puedes permitirlo aquí.
    // Por ahora: explícito para evitar cobros mal calculados.
    throw new Error(`Offering "${offering.title}" has unsupported pricing kind for Wompi: ${offering.pricing.kind}`);
  }

  return { totalAmountCents: total, itemsSnapshot: snapshot };
}

/* -------------------------------------------------------
  Handler
-------------------------------------------------------- */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const body: unknown = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!isObject(body)) return badRequest(res, "Invalid body.");
    const provider = getString(body.provider);
    const itemsRaw = (body as Record<string, unknown>).items;

    if (provider !== "wompi") return badRequest(res, "Only provider=wompi is supported.");
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) return badRequest(res, "Empty cart.");

    const items: CheckoutItemDTO[] = itemsRaw.map((x) => {
      if (!isObject(x)) throw new Error("Invalid item.");
      const offeringId = getString(x.offeringId);
      const quantity = getNumber(x.quantity);
      const selection = (x as Record<string, unknown>).selection;

      if (!offeringId) throw new Error("Missing offeringId.");
      if (quantity === null) throw new Error("Missing quantity.");

      return { offeringId, quantity, selection };
    });

    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const integritySecret = process.env.WOMPI_INTEGRITY_KEY;

    if (!publicKey || !integritySecret) {
      return res.status(501).send("Wompi is not configured. Set WOMPI_PUBLIC_KEY and WOMPI_INTEGRITY_KEY env vars.");
    }

    const siteUrl = process.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000";

    const { totalAmountCents, itemsSnapshot } = computeTotalAndSnapshot(items);
    if (totalAmountCents <= 0) return badRequest(res, "Invalid total amount.");

    const reference = `MGF-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    saveCheckout({
      reference,
      provider: "wompi",
      items: itemsSnapshot,
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

    const out: CreateCheckoutSessionResponse = { url };
    return res.status(200).json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).send(e instanceof Error ? e.message : "Internal Server Error");
  }
}
