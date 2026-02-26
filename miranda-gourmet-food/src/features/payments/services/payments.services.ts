import type { CartItem } from "../../cart/types/cart.types";
import { env } from "../../../app/config/env";
import type { CheckoutStartResult } from "../types/payments.types";
import { wompiProvider } from "../providers/wompi.provider";
import { boldProvider } from "../providers/bold.provider";

export async function startCheckout(items: CartItem[]): Promise<CheckoutStartResult> {
  const provider = env.paymentProvider === "wompi" ? wompiProvider : boldProvider;

  if (!provider.isConfigured()) {
    throw new Error(
      `Payment provider "${provider.id}" is not configured. Missing keys in env.`,
    );
  }

  return provider.startCheckout(items);
}
