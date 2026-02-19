// src/features/cart/context/cart.context.ts
import { createContext, useContext } from "react";
import type { CartAction, CartState } from "../state/cart.reducer";

export const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
