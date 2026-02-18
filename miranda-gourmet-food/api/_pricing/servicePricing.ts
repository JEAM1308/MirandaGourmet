// api/_pricing/servicePricing.ts
export type MenuId = "basic" | "standard" | "gourmet";

export type DietRestriction = { label: string; qty: number };

export type ServiceSelection = {
  menu: MenuId;
  people: { regular: number; vegetarian: number; restricted: DietRestriction[] };
  notes?: string;
};

export type PricingBreakdown = {
  totalPeople: number;
  restrictedQty: number;
  unitPriceCents: number;
  baseSubtotalCents: number;
  vegExtraCents: number;
  restExtraCents: number;
  totalCents: number;
  waitersRequired: number;
};

export type PricingResult =
  | { ok: true; value: PricingBreakdown }
  | { ok: false; error: string };

// ✅ Oferta mínima que necesita el pricing (evitamos acoplar a tu tipo completo)
export type PricingOffering = {
  id: string;
  title: string;
  pricing: {
    tiers: Array<{ minPeople: number; maxPeople: number; unitPriceCents: number }>;
    menus: Record<MenuId, { multiplier: number; label: string }>;
    surcharges: {
      vegetarianPerPersonCents: number;
      restrictionPerPersonCents: number;
    };
    staffing: { waiters: { perPeople: number; min: number } };
    constraints: { minPeople: number; maxPeople: number; maxRestrictionTypes: number };
  };
};

function sumRestrictedQty(restricted: DietRestriction[]): number {
  return restricted.reduce((s, r) => s + r.qty, 0);
}

function isFiniteNonNegInt(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && Number.isInteger(n);
}

function roundMoney(n: number): number {
  return Math.round(n);
}

function resolveTierUnitPriceCents(offering: PricingOffering, totalPeople: number): number | null {
  const t = offering.pricing.tiers.find((x) => totalPeople >= x.minPeople && totalPeople <= x.maxPeople);
  return t ? t.unitPriceCents : null;
}

function computeWaiters(offering: PricingOffering, totalPeople: number): number {
  const staff = offering.pricing.staffing?.waiters;
  if (!staff) return 0;

  const perPeople = staff.perPeople;
  const min = staff.min;

  if (!Number.isFinite(perPeople) || perPeople <= 0) return min ?? 0;
  const calc = Math.ceil(totalPeople / perPeople);
  return Math.max(min ?? 0, calc);
}

export function priceService(offering: PricingOffering, selection: ServiceSelection): PricingResult {
  const reg = selection.people.regular;
  const veg = selection.people.vegetarian;
  const restricted = selection.people.restricted;

  if (!isFiniteNonNegInt(reg) || !isFiniteNonNegInt(veg)) return { ok: false, error: "Invalid people counts." };
  if (!Array.isArray(restricted)) return { ok: false, error: "Invalid restricted list." };

  for (const r of restricted) {
    if (!r || typeof r !== "object") return { ok: false, error: "Invalid restriction entry." };
    if (typeof r.label !== "string" || r.label.trim().length === 0) return { ok: false, error: "Restriction label is required." };
    if (!isFiniteNonNegInt(r.qty) || r.qty <= 0) return { ok: false, error: "Restriction qty must be a positive integer." };
  }

  const restrictedTypes = restricted.length;
  const restrictedQty = sumRestrictedQty(restricted);
  const totalPeople = reg + veg + restrictedQty;

  const c = offering.pricing.constraints;
  if (totalPeople < c.minPeople) return { ok: false, error: `Minimum is ${c.minPeople} people.` };
  if (totalPeople > c.maxPeople) return { ok: false, error: `Maximum is ${c.maxPeople} people.` };
  if (restrictedTypes > c.maxRestrictionTypes) return { ok: false, error: `Max restriction types is ${c.maxRestrictionTypes}.` };

  const tierUnit = resolveTierUnitPriceCents(offering, totalPeople);
  if (tierUnit === null) return { ok: false, error: "No pricing tier matches this people count." };

  const menuCfg = offering.pricing.menus?.[selection.menu];
  if (!menuCfg) return { ok: false, error: "Unsupported menu option." };

  const unitPriceCents = roundMoney(tierUnit * menuCfg.multiplier);

  const vegExtraCents = veg * offering.pricing.surcharges.vegetarianPerPersonCents;
  const restExtraCents = restrictedQty * offering.pricing.surcharges.restrictionPerPersonCents;

  const baseSubtotalCents = totalPeople * unitPriceCents;
  const totalCents = baseSubtotalCents + vegExtraCents + restExtraCents;

  const waitersRequired = computeWaiters(offering, totalPeople);

  return {
    ok: true,
    value: {
      totalPeople,
      restrictedQty,
      unitPriceCents,
      baseSubtotalCents,
      vegExtraCents,
      restExtraCents,
      totalCents,
      waitersRequired,
    },
  };
}
