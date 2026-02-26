import type {
  PaymentProvider,
  RedirectCheckoutResult,
} from "../types/payments.types";
import type { CartItem } from "../../cart/types/cart.types";
import { env } from "../../../app/config/env";

export const wompiProvider: PaymentProvider = {
  id: "wompi",
  isConfigured: () => Boolean(env.wompiPublicKey),

  startCheckout: async (items: CartItem[]): Promise<RedirectCheckoutResult> => {
    const res = await fetch("/api/checkout/create-sessions", {
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

    const data = (await res.json()) as { url: string };

    return {
      kind: "redirect",
      url: data.url,
    };
  },
};
