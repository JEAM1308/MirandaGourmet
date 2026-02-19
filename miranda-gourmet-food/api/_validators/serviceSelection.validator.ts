export type MenuId = "basic" | "standard" | "gourmet";

export type DietRestriction = { label: string; qty: number };

export type ServiceSelection = {
  menu: MenuId;
  people: 
    { regular: number; vegetarian: number; restricted: DietRestriction[] };
  notes?: string;
};

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function getNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function isNonNegInt(n: number): boolean {
  return Number.isInteger(n) && n >= 0;
}

function parseMenuId(v: unknown): MenuId | null {
  const s = getString(v);
  if (s === "basic" || s === "standard" || s === "gourmet") return s;
  return null;
}

function parseDietRestriction(v: unknown): ParseResult<DietRestriction> {
  if (!isObject(v)) return { ok: false, error: "Invalid restriction entry." };

  const label = getString(v.label);
  const qtyNum = getNumber(v.qty);

  if (!label || label.trim().length === 0) {
    return { ok: false, error: "Restriction label is required." };
  }

  if (qtyNum === null || !isNonNegInt(qtyNum) || qtyNum <= 0) {
    return { ok: false, error: "Restriction qty must be a positive integer." };
  }

  return { ok: true, value: { label: label.trim(), qty: qtyNum } };
}

export function parseServiceSelection(input: unknown): ParseResult<ServiceSelection> {
  if (!isObject(input)) return { ok: false, error: "Selection must be an object." };

  const menu = parseMenuId(input.menu) ?? "basic";

  const peopleRaw = input.people;
  if (!isObject(peopleRaw)) return { ok: false, error: 'Missing "people" object.' };

  const regularN = getNumber(peopleRaw.regular);
  const vegetarianN = getNumber(peopleRaw.vegetarian);

  if (regularN === null || !isNonNegInt(regularN)) {
    return { ok: false, error: '"people.regular" must be a non-negative integer.' };
  }
  if (vegetarianN === null || !isNonNegInt(vegetarianN)) {
    return { ok: false, error: '"people.vegetarian" must be a non-negative integer.' };
  }

  const restrictedRaw = peopleRaw.restricted;
  const restrictedArr: unknown[] = Array.isArray(restrictedRaw) ? restrictedRaw : [];

  const restricted: DietRestriction[] = [];
  for (const entry of restrictedArr) {
    const parsed = parseDietRestriction(entry);
    if (!parsed.ok) return parsed;
    restricted.push(parsed.value);
  }

  const notesRaw = input.notes;
  const notes = typeof notesRaw === "string" && notesRaw.trim().length > 0 ? notesRaw.trim() : undefined;

  return {
    ok: true,
    value: {
      menu,
      people: { regular: regularN, vegetarian: vegetarianN, restricted },
      notes,
    },
  };
}
