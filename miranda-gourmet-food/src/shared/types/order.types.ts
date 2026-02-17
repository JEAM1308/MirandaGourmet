export type PaymentProvider = "stripe" | "wompi";

export type OrderStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

export type OrderItemSnapshot = {
  offeringId: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  selection: {
    variantId?: string;
    people?: number;
    dateISO?: string;
    address?: string;
    notes?: string;
  };
};

export type Order = {
  id: string;
  provider: PaymentProvider;
  transactionId: string;
  status: OrderStatus;
  currency: "COP";
  totalAmountCents: number;
  items: OrderItemSnapshot[];
  createdAtISO: string;
};
