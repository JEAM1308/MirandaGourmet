import type { LunchBoxSelection, Offering } from "../types/offering.types";

export type PriceBreakdown = {
  currency: "COP";
  totalPeople: number;
  baseUnitPriceCents: number; // price per person from tier
  baseSubtotalCents: number;
  vegetarianSurchargeCents: number;
  restrictionSurchargeCents: number;
  totalCents: number;
};

function totalPeople(sel: LunchBoxSelection): number {
  const restrictedQty = sel.people.restricted.reduce((sum, r) => sum + r.qty, 0);
  return sel.people.regular + sel.people.vegetarian + restrictedQty;
}

function pickTierUnitPrice(offering: Offering, people: number): number | null {
  const tier = offering.pricing.tiers.find((t) => people >= t.minPeople && people <= t.maxPeople);
  return tier ? tier.unitPriceCents : null;
}

export function priceLunchBox(offering: Offering, sel: LunchBoxSelection): PriceBreakdown {
  const people = totalPeople(sel);

  const unit = pickTierUnitPrice(offering, people);
  if (unit === null) {
    // si no hay tier, devolvemos 0; la validación deberá bloquear checkout
    return {
      currency: "COP",
      totalPeople: people,
      baseUnitPriceCents: 0,
      baseSubtotalCents: 0,
      vegetarianSurchargeCents: 0,
      restrictionSurchargeCents: 0,
      totalCents: 0,
    };
  }

  const baseSubtotal = unit * people;

  const vegExtra = offering.pricing.surcharges.vegetarianPerPersonCents * sel.people.vegetarian;

  const restrictedQty = sel.people.restricted.reduce((sum, r) => sum + r.qty, 0);
  const restExtra = offering.pricing.surcharges.restrictionPerPersonCents * restrictedQty;

  const total = baseSubtotal + vegExtra + restExtra;

  return {
    currency: "COP",
    totalPeople: people,
    baseUnitPriceCents: unit,
    baseSubtotalCents: baseSubtotal,
    vegetarianSurchargeCents: vegExtra,
    restrictionSurchargeCents: restExtra,
    totalCents: total,
  };
}
