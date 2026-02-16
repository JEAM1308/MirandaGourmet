import { createContext } from "react";
import type { CartState } from "../types/cart.types";
import type { CartAction } from "../state/cart.actions";

export type CartContextValue = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
};

export const CartContext = createContext<CartContextValue | null>(null);
