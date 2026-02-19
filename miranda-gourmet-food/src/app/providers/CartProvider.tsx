// src/app/providers/CartProvider.tsx (o donde lo tengas)
import { useReducer } from "react";
import { CartContext } from "../../features/cart/context/cart.context";
import { cartReducer } from "../../features/cart/state/cart.reducer";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}
