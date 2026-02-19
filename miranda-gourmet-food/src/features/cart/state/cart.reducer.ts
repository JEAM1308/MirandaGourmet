// src/features/cart/state/cart.reducer.ts (o donde tengas el reducer)
import type { CartItem } from "../types/cart.types";

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "id"> }   // 👈 importante
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "INCREMENT"; payload: { id: string } }
  | { type: "DECREMENT"; payload: { id: string } }
  | { type: "SET_QTY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR" };

const initialState: CartState = { items: [] };

function uuid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const item: CartItem = { id: uuid(), ...action.payload };

      // si quieres “merge” por offeringId+selection, hazlo aquí (opcional)
      return { ...state, items: [item, ...state.items] };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };

    case "INCREMENT":
      return {
        ...state,
        items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i),
      };

    case "DECREMENT":
      return {
        ...state,
        items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i),
      };

    case "SET_QTY":
      return {
        ...state,
        items: state.items.map(i => i.id === action.payload.id ? { ...i, quantity: Math.max(1, Math.floor(action.payload.quantity || 1)) } : i),
      };

    case "CLEAR":
      return initialState;

    default:
      return state;
  }
}
