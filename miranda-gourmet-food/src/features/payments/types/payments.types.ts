import type { CartItem } from "../../cart/types/cart.types";

export type CheckoutStartResult = { url: string };

export type PaymentProviderId = "stripe" | "wompi";

export type PaymentProvider = {
  id: PaymentProviderId;
  startCheckout(items: CartItem[]): Promise<CheckoutStartResult>;
  isConfigured(): boolean; // para bloquear botón si faltan llaves
};
