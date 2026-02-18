export type CheckoutItemInput = {
  offeringId: string;
  quantity: number;
  selection: unknown;
};

export async function createCheckoutSession(input: { items: CheckoutItemInput[] }) {
  const res = await fetch("/api/checkout/create-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to create checkout session");
  }

  return (await res.json()) as { url: string };
}