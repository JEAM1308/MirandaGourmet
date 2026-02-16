import type { OfferingSelection } from "../../catalog/types/offering.types";

export type CheckoutItemDTO = {
  offeringId: string;
  quantity: number;
  selection: OfferingSelection;
};

export type CreateCheckoutSessionRequest = {
  items: CheckoutItemDTO[];
};

export type CreateCheckoutSessionResponse = {
  url: string;
};
