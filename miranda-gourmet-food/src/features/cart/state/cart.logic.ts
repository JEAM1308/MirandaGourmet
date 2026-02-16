import type { CartItem, CartState } from "../types/cart.types";

// Dos líneas se consideran “iguales” si tienen mismo offering + misma selección
export function isSameLine(a: CartItem, b: Pick<CartItem, "offeringId" | "selection">) {
  return (
    a.offeringId === b.offeringId &&
    stableStringify(a.selection) === stableStringify(b.selection)
  );
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value !== null && typeof value === "object") {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => [key, sortObject(val)]);

    return Object.fromEntries(sortedEntries);
  }

  return value;
}

export function cartTotals(state: CartState) {
  const subtotalCents = state.items.reduce((sum, item) => {
    const unit = item.estimatedUnitPriceCents ?? 0;
    return sum + unit * item.quantity;
  }, 0);

  return { subtotalCents };
}
