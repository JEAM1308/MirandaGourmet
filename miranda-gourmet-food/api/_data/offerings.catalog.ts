export type CatalogOffering = {
  id: string;
  title: string;
  subtitle?: string;

  type: "STANDARD_SERVICE" | "PREMIUM_SERVICE" | "QUOTE_SERVICE";

  /**
   * pricing:
   * - STRIPE_*: precios fijos
   * - QUOTE: solo cotización (no checkout)
   * - TIERED_PER_PERSON: servicios estandarizados (dinámicos) 
   */
  pricing:
    | { kind: "STRIPE_PRICE"; stripePriceId: string }
    | { kind: "STRIPE_VARIANTS"; variants: Record<string, string> }
    | { kind: "QUOTE" }
    | {
        kind: "TIERED_PER_PERSON";
        currency: "COP";
        model: "per_person_tiered";

        menus: Record<
          "basic" | "standard" | "gourmet",
          {
            label: string;
            /** multiplica el unitPrice del tier (ej: 1.0 / 1.12 / 1.25) */
            multiplier: number;
          }
        >;

        tiers: Array<{
          minPeople: number;
          maxPeople: number; // inclusive
          /** precio base por persona ANTES del menú */
          unitPriceCents: number;
        }>;

        surcharges: {
          vegetarianPerPersonCents: number;
          restrictionPerPersonCents: number;
        };

        constraints: {
          minPeople: number;
          maxPeople: number;
          maxRestrictionTypes: number;
        };

        staffing: {
          minWaiters: number;
          peoplePerWaiter: number; // 1 mesero por X personas
        };
      };

  // Stripe addons (si los usas en productos fijos)
  addons?: Record<string, string>; // addonId -> stripePriceId

  // Wompi legacy (si usas montos fijos por offering)
  wompiPricing?:
    | { kind: "AMOUNT"; amountInCents: number }
    | { kind: "VARIANTS"; variants: Record<string, number> };

  wompiAddons?: Record<string, number>;

  quantitySource: "ITEM_QTY" | "PEOPLE";
  minLeadTimeHours?: number;
  required?: Array<"DATE" | "ADDRESS" | "PEOPLE" | "VARIANT">;
};

/**
 * ✅ Catálogo corporativos (4 servicios estandarizados)
 * NOTA: precios aquí son placeholders razonables (ajústalos).
 */
export const catalog: CatalogOffering[] = [
  {
    id: "lunch-box",
    title: "Lunch Box",
    subtitle: "Almuerzos individuales para equipos",
    type: "STANDARD_SERVICE",
    pricing: {
      kind: "TIERED_PER_PERSON",
      currency: "COP",
      model: "per_person_tiered",

      menus: {
        basic: { label: "Menú básico", multiplier: 1.0 },
        standard: { label: "Menú estándar", multiplier: 1.12 },
        gourmet: { label: "Menú gourmet", multiplier: 1.25 },
      },

      // 5–30 personas
      tiers: [
        { minPeople: 5, maxPeople: 10, unitPriceCents: 32000 },
        { minPeople: 11, maxPeople: 20, unitPriceCents: 30000 },
        { minPeople: 21, maxPeople: 30, unitPriceCents: 28500 },
      ],

      surcharges: {
        vegetarianPerPersonCents: 2000,
        restrictionPerPersonCents: 3000,
      },

      constraints: {
        minPeople: 5,
        maxPeople: 30,
        maxRestrictionTypes: 5,
      },

      staffing: {
        minWaiters: 0,
        peoplePerWaiter: 9999, // delivery: no meseros por defecto
      },
    },
    quantitySource: "ITEM_QTY",
    minLeadTimeHours: 24,
    // Para “pedir”, normalmente necesitarás fecha y dirección (si lo estás manejando así)
    required: ["DATE", "ADDRESS"],
  },

  {
    id: "eventos-masivos",
    title: "Eventos Masivos",
    subtitle: "Grandes volúmenes con logística",
    type: "STANDARD_SERVICE",
    pricing: {
      kind: "TIERED_PER_PERSON",
      currency: "COP",
      model: "per_person_tiered",

      menus: {
        basic: { label: "Menú básico", multiplier: 1.0 },
        standard: { label: "Menú estándar", multiplier: 1.12 },
        gourmet: { label: "Menú gourmet", multiplier: 1.25 },
      },

      // 50–400 personas
      tiers: [
        { minPeople: 50, maxPeople: 100, unitPriceCents: 29000 },
        { minPeople: 101, maxPeople: 200, unitPriceCents: 27000 },
        { minPeople: 201, maxPeople: 400, unitPriceCents: 25500 },
      ],

      surcharges: {
        vegetarianPerPersonCents: 2500,
        restrictionPerPersonCents: 3500,
      },

      constraints: {
        minPeople: 50,
        maxPeople: 400,
        maxRestrictionTypes: 8,
      },

      staffing: {
        minWaiters: 4,
        peoplePerWaiter: 25,
      },
    },
    quantitySource: "ITEM_QTY",
    minLeadTimeHours: 72,
    required: ["DATE", "ADDRESS"],
  },

  {
    id: "entrega-empresarial",
    title: "Entrega Empresarial",
    subtitle: "Catering recurrente para oficina",
    type: "STANDARD_SERVICE",
    pricing: {
      kind: "TIERED_PER_PERSON",
      currency: "COP",
      model: "per_person_tiered",

      menus: {
        basic: { label: "Menú básico", multiplier: 1.0 },
        standard: { label: "Menú estándar", multiplier: 1.12 },
        gourmet: { label: "Menú gourmet", multiplier: 1.25 },
      },

      // 10–100 personas
      tiers: [
        { minPeople: 10, maxPeople: 30, unitPriceCents: 30500 },
        { minPeople: 31, maxPeople: 60, unitPriceCents: 29000 },
        { minPeople: 61, maxPeople: 100, unitPriceCents: 27500 },
      ],

      surcharges: {
        vegetarianPerPersonCents: 2000,
        restrictionPerPersonCents: 3000,
      },

      constraints: {
        minPeople: 10,
        maxPeople: 100,
        maxRestrictionTypes: 6,
      },

      staffing: {
        minWaiters: 0,
        peoplePerWaiter: 9999, // normalmente delivery/entrega, no meseros
      },
    },
    quantitySource: "ITEM_QTY",
    minLeadTimeHours: 24,
    required: ["DATE", "ADDRESS"],
  },

  {
    id: "experiencia-gala",
    title: "Experiencia de Gala",
    subtitle: "Recepciones ejecutivas premium",
    type: "PREMIUM_SERVICE",
    pricing: {
      kind: "TIERED_PER_PERSON",
      currency: "COP",
      model: "per_person_tiered",

      menus: {
        basic: { label: "Menú básico", multiplier: 1.0 },
        standard: { label: "Menú estándar", multiplier: 1.15 },
        gourmet: { label: "Menú gourmet", multiplier: 1.32 },
      },

      // 30–200 personas
      tiers: [
        { minPeople: 30, maxPeople: 60, unitPriceCents: 52000 },
        { minPeople: 61, maxPeople: 120, unitPriceCents: 49500 },
        { minPeople: 121, maxPeople: 200, unitPriceCents: 47000 },
      ],

      surcharges: {
        vegetarianPerPersonCents: 3500,
        restrictionPerPersonCents: 4500,
      },

      constraints: {
        minPeople: 30,
        maxPeople: 200,
        maxRestrictionTypes: 10,
      },

      staffing: {
        minWaiters: 3,
        peoplePerWaiter: 18,
      },
    },
    quantitySource: "ITEM_QTY",
    minLeadTimeHours: 96,
    required: ["DATE", "ADDRESS"],
  },

  /**
   * Si aún tienes productos “legacy” con Stripe fijo,
   * los puedes seguir metiendo aquí SIN problema.
   *
   * Ej:
   * {
   *   id: "algo-stripe",
   *   title: "Producto fijo",
   *   type: "STANDARD_SERVICE",
   *   pricing: { kind: "STRIPE_PRICE", stripePriceId: "price_..." },
   *   quantitySource: "ITEM_QTY",
   * }
   */
];
