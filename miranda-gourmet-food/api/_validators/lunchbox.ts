import type { LunchBoxSelection } from "../_pricing/lunchbox";

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function validateLunchBox(input: unknown): Ok<LunchBoxSelection> | Err {
  if (!isObject(input)) return { ok: false, error: "Selection must be an object." };

  const people = input.people;
  if (!isObject(people)) return { ok: false, error: 'Missing "people".' };

  const regular = asNumber(people.regular);
  const vegetarian = asNumber(people.vegetarian);
  const restricted = people.restricted;

  if (regular === null || regular < 0) return { ok: false, error: 'Invalid "people.regular".' };
  if (vegetarian === null || vegetarian < 0) return { ok: false, error: 'Invalid "people.vegetarian".' };
  if (!Array.isArray(restricted)) return { ok: false, error: 'Invalid "people.restricted".' };

  const parsedRestricted: { label: string; qty: number }[] = [];

  for (const r of restricted) {
    if (!isObject(r)) return { ok: false, error: "Invalid restricted item." };
    const label = typeof r.label === "string" ? r.label.trim() : "";
    const qty = asNumber(r.qty);

    if (!label) return { ok: false, error: "Restricted label is required." };
    if (qty === null || qty <= 0) return { ok: false, error: "Restricted qty must be > 0." };

    parsedRestricted.push({ label, qty: Math.floor(qty) });
  }

  const notes = typeof input.notes === "string" ? input.notes : undefined;

  const out: LunchBoxSelection = {
    people: {
      regular: Math.floor(regular),
      vegetarian: Math.floor(vegetarian),
      restricted: parsedRestricted,
    },
    notes,
  };

  const restrictedQty = out.people.restricted.reduce((s, r) => s + r.qty, 0);
  const totalPeople = out.people.regular + out.people.vegetarian + restrictedQty;

    if (totalPeople <= 0) {
        return { ok: false, error: "Debe haber al menos 1 persona." };
    }
    else {
        return { ok: true, value: out };
    }
}
