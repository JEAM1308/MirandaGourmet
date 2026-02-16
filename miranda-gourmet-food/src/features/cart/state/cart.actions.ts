import type { CartItem } from "../types/cart.types";

export type AddToCartPayload = Omit<CartItem, "id" | "createdAtISO" | "updatedAtISO">;

export type CartAction =
  | { type: "ADD_ITEM"; payload: AddToCartPayload; mergeIfSame?: boolean }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "SET_QTY"; payload: { id: string; quantity: number } }
  | { type: "INCREMENT"; payload: { id: string } }
  | { type: "DECREMENT"; payload: { id: string } }
  | { type: "UPDATE_SELECTION"; payload: { id: string; selection: CartItem["selection"] } }
  | { type: "CLEAR" };
