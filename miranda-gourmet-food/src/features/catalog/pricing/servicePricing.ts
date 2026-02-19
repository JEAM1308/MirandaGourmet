import type { DietRestriction, Offering } from "../types/offering.types";

export type MenuId = "basic" | "standard" | "gourmet";

export type ServiceSelection = {
  menu: MenuId;
  people: {
    regular: number;
    vegetarian: number;
    restricted: DietRestriction[];
  };
  notes?: string;
};

export type PricingBreakdown = {
  totalPeople: number;
  restrictedQty: number;

  unitPriceCents: number; // ya con menú aplicado
  baseSubtotalCents: number;

  vegExtraCents: number;
  restExtraCents: number;

  totalCents: number;

  waitersRequired: number;
};

export type PricingResult =
  | { ok: true; value: PricingBreakdown }
  | { ok: false; error: string };

function sumRestrictedQty(restricted: DietRestriction[]): number {
  return restricted.reduce((s, r) => s + r.qty, 0);
}

function isFiniteNonNegInt(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && Number.isInteger(n);
}

function roundMoney(n: number): number {
  // COP cents: redondeo al entero más cercano
  return Math.round(n);
}

function resolveTierUnitPriceCents(offering: Offering, totalPeople: number): number | null {
  const t = offering.pricing.tiers.find(
    (x) => totalPeople >= x.minPeople && totalPeople <= x.maxPeople
  );
  return t ? t.unitPriceCents : null;
}

function computeWaiters(offering: Offering, totalPeople: number): number {
  const staff = offering.pricing.staffing?.waiters;
  if (!staff) return 0;

  const perPeople = staff.perPeople;
  const min = staff.min;

  if (!Number.isFinite(perPeople) || perPeople <= 0) return min ?? 0;
  const calc = Math.ceil(totalPeople / perPeople);
  return Math.max(min ?? 0, calc);
}

/**
 * ✅ Valida + calcula total estandarizado para cualquier Offering
 */
export function priceService(offering: Offering, selection: ServiceSelection): PricingResult {
  // ---- Validate selection numbers
  const reg = selection.people.regular;
  const veg = selection.people.vegetarian;
  const restricted = selection.people.restricted;

  if (!isFiniteNonNegInt(reg) || !isFiniteNonNegInt(veg)) {
    return { ok: false, error: "Invalid people counts." };
  }
  if (!Array.isArray(restricted)) {
    return { ok: false, error: "Invalid restricted list." };
  }

  // ---- Validate restricted entries
  for (const r of restricted) {
    if (!r || typeof r !== "object") return { ok: false, error: "Restricción inválida." };
    if (typeof r.label !== "string" || r.label.trim().length === 0) {
      return { ok: false, error: "Se requere una etiqueta para la restricción." };
    }
    if (!isFiniteNonNegInt(r.qty) || r.qty <= 0) {
      return { ok: false, error: "Restriction qty must be a positive integer." };
    }
  }

  const restrictedTypes = restricted.length;
  const restrictedQty = sumRestrictedQty(restricted);
  const totalPeople = reg + veg + restrictedQty;

  // ---- Constraints from offering
  const c = offering.pricing.constraints;
  if (totalPeople < c.minPeople) return { ok: false, error: `Para este servicio, el mínimo de personas es ${c.minPeople}.` };
  if (totalPeople > c.maxPeople) return { ok: false, error: `Para este servicio, el máximo de personas es ${c.maxPeople}.` };
  if (restrictedTypes > c.maxRestrictionTypes) {
    return { ok: false, error: `Max restriction types is ${c.maxRestrictionTypes}.` };
  }

  // ---- Tier pricing
  const tierUnit = resolveTierUnitPriceCents(offering, totalPeople);
  if (tierUnit === null) {
    return { ok: false, error: "No pricing tier matches this people count." };
  }

  // ---- Menu pricing
  const menuCfg = offering.pricing.menus?.[selection.menu];
  if (!menuCfg) return { ok: false, error: "Opción de menú inválida." };

  const unitPriceCents = roundMoney(tierUnit * menuCfg.multiplier);

  // ---- Surcharges
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
