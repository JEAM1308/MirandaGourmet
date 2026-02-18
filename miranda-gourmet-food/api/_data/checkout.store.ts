
export type CheckoutItemSnapshot = {
  offeringId: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  selection: unknown; // ✅ backend-safe
};
export type CheckoutRecord = {
  reference: string;
  provider: "wompi" | "stripe";
  items: CheckoutItemSnapshot[];
  totalAmountCents: number;
  createdAtISO: string;
};


const sessions: Record<string, CheckoutRecord> = {};

export function saveCheckout(snapshot: CheckoutRecord) {
  sessions[snapshot.reference] = snapshot;
}

export function getCheckout(reference: string): CheckoutRecord | null {
  return sessions[reference] ?? null;
}

export function deleteCheckout(reference: string) {
  delete sessions[reference];
}
