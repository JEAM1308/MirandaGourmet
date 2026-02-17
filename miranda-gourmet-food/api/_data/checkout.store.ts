import type { OrderItemSnapshot } from "../../src/shared/types/order.types";

export type CheckoutSnapshot = {
  reference: string;
  provider: "wompi" | "stripe";
  items: OrderItemSnapshot[];
  totalAmountCents: number;
  createdAtISO: string;
};

const sessions: Record<string, CheckoutSnapshot> = {};

export function saveCheckout(snapshot: CheckoutSnapshot) {
  sessions[snapshot.reference] = snapshot;
}

export function getCheckout(reference: string): CheckoutSnapshot | null {
  return sessions[reference] ?? null;
}

export function deleteCheckout(reference: string) {
  delete sessions[reference];
}
