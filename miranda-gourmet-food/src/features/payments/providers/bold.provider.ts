import type {
  BoldEmbeddedCheckoutResult,
  PaymentProvider,
} from "../types/payments.types";
import type { CartItem } from "../../cart/types/cart.types";
import { env } from "../../../app/config/env";

type BoldCheckoutSessionResponse = {
  provider: "bold";
  apiKey: string;
  amount: number;
  currency: "COP" | "USD";
  orderId: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
};

export const boldProvider: PaymentProvider = {
  id: "bold",
  isConfigured: () => Boolean(env.boldApiKey),

  startCheckout: async (items: CartItem[]): Promise<BoldEmbeddedCheckoutResult> => {
    const res = await fetch("/api/checkout/create-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "bold",
        items: items.map((i) => ({
          offeringId: i.offeringId,
          quantity: i.quantity,
          selection: i.selection,
        })),
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data = (await res.json()) as BoldCheckoutSessionResponse;

    return {
      kind: "bold-embedded",
      apiKey: data.apiKey,
      amount: data.amount,
      currency: data.currency,
      orderId: data.orderId,
      integritySignature: data.integritySignature,
      description: data.description,
      redirectionUrl: data.redirectionUrl,
    };
  },
};
