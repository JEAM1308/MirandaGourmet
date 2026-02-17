import type { PaymentProvider } from "../types/payments.types";
import type { CartItem } from "../../cart/types/cart.types";

export const stripeProvider: PaymentProvider = {
  id: "stripe",
  isConfigured: () => true, // serverless es el que exige STRIPE_SECRET_KEY

  startCheckout: async (items: CartItem[]) => {
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "stripe",
        items: items.map((i) => ({
          offeringId: i.offeringId,
          quantity: i.quantity,
          selection: i.selection,
        })),
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as { url: string };
  },
};
