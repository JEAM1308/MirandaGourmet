export type CatalogOffering = {
  id: string;
  title: string;
  type: "STANDARD_SERVICE" | "PREMIUM_SERVICE" | "QUOTE_SERVICE";

  pricing:
    | { kind: "STRIPE_PRICE"; stripePriceId: string }
    | { kind: "STRIPE_VARIANTS"; variants: Record<string, string> }
    | { kind: "QUOTE" };

  addons?: Record<string, string>; // addonId -> stripePriceId

  // NUEVO: montos para Wompi (en centavos COP)
  wompiPricing?:
    | { kind: "AMOUNT"; amountInCents: number }
    | { kind: "VARIANTS"; variants: Record<string, number> }; // variantId -> amountInCents

  wompiAddons?: Record<string, number>; // addonId -> amountInCents

  quantitySource: "ITEM_QTY" | "PEOPLE";
  minLeadTimeHours?: number;
  required?: Array<"DATE" | "ADDRESS" | "PEOPLE" | "VARIANT">;
};

export const catalog: CatalogOffering[] = [
  // EJEMPLOS — ajustar con priceIds reales
  {
    id: "lunchbox",
    title: "Lunch Box (Reuniones Ejecutivas)",
    type: "STANDARD_SERVICE",
    pricing: {
      kind: "STRIPE_VARIANTS",
      variants: {
        standard: "price_123_standard",
        premium: "price_456_premium",
      },
    },
    addons: {
      bebida_extra: "price_addon_bebida",
    },
    quantitySource: "ITEM_QTY",
    minLeadTimeHours: 24,
    required: ["DATE", "ADDRESS", "VARIANT"],
  },
  {
    id: "experiencia-gala",
    title: "Experiencia de Gala",
    type: "PREMIUM_SERVICE",
    pricing: { kind: "STRIPE_PRICE", stripePriceId: "price_gala_pp" },
    quantitySource: "PEOPLE",
    minLeadTimeHours: 48,
    required: ["DATE", "ADDRESS", "PEOPLE"],
  },
];
