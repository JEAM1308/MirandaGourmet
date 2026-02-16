import React, { useEffect, useMemo, useReducer } from "react";
import { cartReducer, initialCartState } from "../../features/cart/state/cart.reducer";
import { loadCartState, saveCartState } from "../../features/cart/state/cart.storage";
import { CartContext } from "../../features/cart/context/cart.context";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, (init) => {
    const stored = loadCartState();
    return stored ?? init;
  });

  useEffect(() => {
    saveCartState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
