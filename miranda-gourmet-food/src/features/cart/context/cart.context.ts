// src/features/cart/context/cart.context.ts
import { createContext } from "react";
import type { CartAction, CartState } from "../state/cart.reducer";

export const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

