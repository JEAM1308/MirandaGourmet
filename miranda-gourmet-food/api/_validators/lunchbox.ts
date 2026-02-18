import type { LunchBoxSelection } from "../_pricing/lunchbox";

export function validateLunchBox(sel: LunchBoxSelection) {
  const restrictedQty = sel.people.restricted.reduce((s, r) => s + r.qty, 0);
  const total =
    sel.people.regular +
    sel.people.vegetarian +
    restrictedQty;

  if (total < 10) {
    return { ok: false, error: "Minimum 10 people required." };
  }

  if (total > 500) {
    return { ok: false, error: "Too many people." };
  }

  return { ok: true };
}
