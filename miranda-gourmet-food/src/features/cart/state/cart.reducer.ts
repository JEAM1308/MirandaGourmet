import type { CartState, CartItem } from "../types/cart.types";
import type { CartAction } from "./cart.actions";
import { isSameLine } from "./cart.logic";

export const initialCartState: CartState = { items: [] };

function nowISO() {
  return new Date().toISOString();
}

function generateId() {
  // Suficiente para frontend; si quieres, luego metemos crypto.randomUUID()
  return `ci_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const merge = action.mergeIfSame ?? true;
      const payload = action.payload;

      if (payload.quantity <= 0) return state;

      if (merge) {
        const existing = state.items.find((i) => isSameLine(i, payload));
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + payload.quantity, updatedAtISO: nowISO() }
                : i
            ),
          };
        }
      }

      const newItem: CartItem = {
        ...payload,
        id: generateId(),
        createdAtISO: nowISO(),
        updatedAtISO: nowISO(),
      };

      return { items: [newItem, ...state.items] };
    }

    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.payload.id) };

    case "SET_QTY": {
      const qty = Math.max(0, Math.floor(action.payload.quantity));
      if (qty === 0) return { items: state.items.filter((i) => i.id !== action.payload.id) };
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, quantity: qty, updatedAtISO: nowISO() } : i
        ),
      };
    }

    case "INCREMENT":
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1, updatedAtISO: nowISO() }
            : i
        ),
      };

    case "DECREMENT":
      return {
        items: state.items
          .map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity - 1, updatedAtISO: nowISO() }
              : i
          )
          .filter((i) => i.quantity > 0),
      };

    case "UPDATE_SELECTION":
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, selection: action.payload.selection, updatedAtISO: nowISO() }
            : i
        ),
      };

    case "CLEAR":
      return initialCartState;

    default:
      return state;
  }
}
