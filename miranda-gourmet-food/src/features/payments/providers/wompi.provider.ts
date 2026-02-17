import type { PaymentProvider } from "../types/payments.types";
import type { CartItem } from "../../cart/types/cart.types";
import { env } from "../../../app/config/env";

export const wompiProvider: PaymentProvider = {
  id: "wompi",
  isConfigured: () => Boolean(env.wompiPublicKey), // por ahora solo check simple

  startCheckout: async (items: CartItem[]) => {
    // La creación real de la transacción se hace en serverless (con la private key)
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "wompi",
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
