import type { CartItem } from "../../cart/types/cart.types";
import { env } from "../../../app/config/env";
import { stripeProvider } from "../providers/stripe.provider";
import { wompiProvider } from "../providers/wompi.provider";

export async function startCheckout(items: CartItem[]) {
  const provider = env.paymentProvider === "wompi" ? wompiProvider : stripeProvider;

  if (!provider.isConfigured()) {
    throw new Error(
      `Payment provider "${provider.id}" is not configured. Missing keys in env.`
    );
  }

  return provider.startCheckout(items);
}
