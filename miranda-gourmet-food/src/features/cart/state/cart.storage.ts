import type { CartState } from "../types/cart.types";

const KEY = "miranda_cart_v1";

export function loadCartState(): CartState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CartState;
  } catch {
    return null;
  }
}

export function saveCartState(state: CartState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // si falla (quota, privacy mode), no rompemos la app
  }
}

export function clearCartStorage() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 
  }
}
