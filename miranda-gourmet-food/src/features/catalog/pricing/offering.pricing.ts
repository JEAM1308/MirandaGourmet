import type { Offering, DietRestriction } from "../types/offering.types";

export function sumRestrictedQty(restricted: DietRestriction[]): number {
  return restricted.reduce((s, r) => s + r.qty, 0);
}

export function totalPeopleFromSelection(selection: {
  people: { regular: number; vegetarian: number; restricted: DietRestriction[] };
}): number {
  const restrictedQty = sumRestrictedQty(selection.people.restricted);
  return selection.people.regular + selection.people.vegetarian + restrictedQty;
}

export function resolveTierUnitPriceCents(offering: Offering, totalPeople: number): number | null {
  const t = offering.pricing.tiers.find(
    (x) => totalPeople >= x.minPeople && totalPeople <= x.maxPeople
  );
  return t ? t.unitPriceCents : null;
}

/**
 * Calcula total (COP cents) usando:
 * - unit price por tier (por persona)
 * - recargo vegetarianos por persona
 * - recargo restricciones por persona restringida
 */
export function calculatePerPersonTieredTotalCents(
  offering: Offering,
  selection: {
    people: { regular: number; vegetarian: number; restricted: DietRestriction[] };
  }
) {
  const restrictedQty = sumRestrictedQty(selection.people.restricted);
  const totalPeople = selection.people.regular + selection.people.vegetarian + restrictedQty;

  const unitPrice = resolveTierUnitPriceCents(offering, totalPeople);
  if (unitPrice === null) {
    return { ok: false as const, error: "No tier pricing matches total people." };
  }

  const base = totalPeople * unitPrice;
  const vegExtra = selection.people.vegetarian * offering.pricing.surcharges.vegetarianPerPersonCents;
  const restExtra = restrictedQty * offering.pricing.surcharges.restrictionPerPersonCents;

  const totalCents = base + vegExtra + restExtra;

  return {
    ok: true as const,
    value: {
      totalPeople,
      restrictedQty,
      unitPriceCents: unitPrice,
      baseSubtotalCents: base,
      vegExtraCents: vegExtra,
      restExtraCents: restExtra,
      totalCents,
    },
  };
}
