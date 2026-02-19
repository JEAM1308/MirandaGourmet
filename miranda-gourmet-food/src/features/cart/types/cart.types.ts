import type { OfferingId } from "../../catalog/types/offering.types";
import type { ServiceSelection } from "../../catalog/types/offering.types";

export type CartItem = {
  id: string; // uuid interno del carrito
  offeringId: OfferingId;

  title: string;
  unitLabel?: string;

  image?: { src: string; alt?: string };

  quantity: number; // normalmente 1 en estos servicios
  selection: ServiceSelection;

  estimatedUnitPriceCents?: number;
};

export type CartState = {
  items: CartItem[];
};


export type DietRestriction = {
  label: string;
  qty: number;
};

export type MenuId = "basic" | "standard" | "gourmet";

