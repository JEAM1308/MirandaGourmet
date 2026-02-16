
import type { OfferingSelection } from "../../catalog/types/offering.types";

export type CartItemId = string;

export type CartItem = {
  id: CartItemId;              // id único por línea (no por offering)
  offeringId: string;
  title: string;
  image?: { src: string; alt: string };

  // para UI (no confiamos en esto en backend, pero sirve)
  unitLabel?: string;          // "caja", "persona", "paquete"
  estimatedUnitPriceCents?: number;
  currency?: "COP" | "USD";

  quantity: number;

  selection: OfferingSelection; // configuración (people/date/address/variant/addons...)

  // control
  createdAtISO: string;
  updatedAtISO: string;
};

export type CartState = {
  items: CartItem[];
};
