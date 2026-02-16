export type CatalogOffering = {
  id: string;
  title: string;

  type: "STANDARD_SERVICE" | "PREMIUM_SERVICE" | "QUOTE_SERVICE";

  pricing:
    | { kind: "STRIPE_PRICE"; stripePriceId: string }
    | { kind: "STRIPE_VARIANTS"; variants: Record<string, string> } // variantId -> priceId
    | { kind: "QUOTE" };

  // Add-ons (addonId -> stripePriceId)
  addons?: Record<string, string>;

  // Define cómo calcular cantidad para el precio base:
  // - ITEM_QTY: usa item.quantity (ej: “cajas”)
  // - PEOPLE: usa selection.people (ej: “por persona”)
  quantitySource: "ITEM_QTY" | "PEOPLE";

  minLeadTimeHours?: number;

  // Required fields mínimos para server validation
  required?: Array<"DATE" | "ADDRESS" | "PEOPLE" | "VARIANT">;
};

export const catalog: CatalogOffering[] = [
  // EJEMPLOS — ajusta con tus priceIds reales
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
