import type { CartItem } from "../../cart/types/cart.types";

export type PaymentProviderId = "bold";

export type RedirectCheckoutResult = {
  kind: "redirect";
  url: string;
};

export type BoldEmbeddedCheckoutResult = {
  kind: "bold-embedded";
  apiKey: string;
  amount: number; // monto en unidad de divisa (sin decimales)
  currency: "COP" | "USD";
  orderId: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
};

export type CheckoutStartResult = RedirectCheckoutResult | BoldEmbeddedCheckoutResult;

export type PaymentProvider = {
  id: PaymentProviderId;
  startCheckout(items: CartItem[]): Promise<CheckoutStartResult>;
  isConfigured(): boolean; // para bloquear botón si faltan llaves
};
