export type LunchBoxSelection = {
  people: {
    regular: number;
    vegetarian: number;
    restricted: { label: string; qty: number }[];
  };
  notes?: string;
};

export function calculateLunchBoxTotalCents(sel: LunchBoxSelection) {
  const BASE_PRICE = 32000; // COP
  const VEGETARIAN_SURCHARGE = 2000;
  const RESTRICTION_SURCHARGE = 3000;

  const restrictedQty = sel.people.restricted.reduce((s, r) => s + r.qty, 0);

  const totalPeople =
    sel.people.regular +
    sel.people.vegetarian +
    restrictedQty;

  const baseSubtotal = totalPeople * BASE_PRICE;
  const vegExtra = sel.people.vegetarian * VEGETARIAN_SURCHARGE;
  const restExtra = restrictedQty * RESTRICTION_SURCHARGE;

  return {
    totalPeople,
    baseSubtotal,
    vegExtra,
    restExtra,
    totalCents: baseSubtotal + vegExtra + restExtra,
  };
}
