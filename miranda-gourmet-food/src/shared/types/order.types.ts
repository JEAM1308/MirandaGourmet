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
  selection: unknown; // backend/store puede guardar cualquier forma; el frontend hace cast al mostrar
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
