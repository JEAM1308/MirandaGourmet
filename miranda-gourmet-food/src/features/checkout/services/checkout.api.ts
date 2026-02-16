import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "../types/checkout.types";

export async function createCheckoutSession(
  payload: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  const res = await fetch("/api/checkout/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Checkout failed (${res.status}): ${text}`);
  }

  return (await res.json()) as CreateCheckoutSessionResponse;
}
