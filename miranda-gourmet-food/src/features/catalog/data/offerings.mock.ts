import type { Offering } from "../types/offering.types";

export const offeringsMock: Offering[] = [
  /* =========================================================
     LUNCH BOX
  ========================================================= */
  {
    id: "lunch-box",
    kind: "service",
    title: "Lunch Box",
    subtitle: "Ideal para oficinas y equipos pequeños.",
    image: {
      src: "/assets/services/lunchbox.jpg",
      alt: "Lunch Box",
    },
    pricing: {
        kind: "TIERED_PER_PERSON",
        currency: "COP",
        model: "per_person_tiered",
      // Precio base del menú BASIC
        tiers: [
            { minPeople: 5,  maxPeople: 15, unitPriceCents: 3200000 }, // 32.000
            { minPeople: 16, maxPeople: 30, unitPriceCents: 3000000 }, // 30.000
        ],

      // Multiplicadores por menú
      menus: {
        basic:    { multiplier: 1.0,  label: "Menú Básico" },
        standard: { multiplier: 1.15, label: "Menú Estándar" },
        gourmet:  { multiplier: 1.35, label: "Menú Gourmet" },
      },

      surcharges: {
        vegetarianPerPersonCents: 200000,   // 2.000
        restrictionPerPersonCents: 300000,  // 3.000
      },

      staffing: {
        waiters: {
          perPeople: 15,
          min: 0, // solo entrega, no obligatorio
        },
      },

      constraints: {
        minPeople: 5,
        maxPeople: 30,
        maxRestrictionTypes: 5,
      },
    },
  },

  /* =========================================================
     EVENTOS MASIVOS
  ========================================================= */
  {
    id: "eventos-masivos",
    kind: "service",
    title: "Eventos Masivos",
    subtitle: "Catering para grandes grupos con logística profesional.",
    image: {
      src: "/assets/services/masivos.jpg",
      alt: "Eventos Masivos",
    },
    pricing: {
        kind: "TIERED_PER_PERSON",
        currency: "COP",
        model: "per_person_tiered",

      tiers: [
        { minPeople: 50,  maxPeople: 150, unitPriceCents: 4500000 }, // 45.000
        { minPeople: 151, maxPeople: 300, unitPriceCents: 4200000 }, // 42.000
        { minPeople: 301, maxPeople: 400, unitPriceCents: 3900000 }, // 39.000
      ],

      menus: {
        basic:    { multiplier: 1.0,  label: "Menú Básico" },
        standard: { multiplier: 1.18, label: "Menú Estándar" },
        gourmet:  { multiplier: 1.38, label: "Menú Gourmet" },
      },

      surcharges: {
        vegetarianPerPersonCents: 250000,  // 2.500
        restrictionPerPersonCents: 350000, // 3.500
      },

      staffing: {
        waiters: {
          perPeople: 25,
          min: 2,
        },
      },

      constraints: {
        minPeople: 50,
        maxPeople: 400,
        maxRestrictionTypes: 8,
      },
    },
  },

  /* =========================================================
     ENTREGA EMPRESARIAL
  ========================================================= */
  {
    id: "entrega-empresarial",
    kind: "service",
    title: "Entrega Empresarial",
    subtitle: "Solución práctica para equipos corporativos.",
    image: {
      src: "/assets/services/entrega.jpg",
      alt: "Entrega Empresarial",
    },
    pricing: {
        kind: "TIERED_PER_PERSON",
      currency: "COP",
      model: "per_person_tiered",

      tiers: [
        { minPeople: 10,  maxPeople: 40,  unitPriceCents: 3500000 }, // 35.000
        { minPeople: 41,  maxPeople: 100, unitPriceCents: 3100000 }, // 31.000
      ],

      menus: {
        basic:    { multiplier: 1.0,  label: "Menú Básico" },
        standard: { multiplier: 1.16, label: "Menú Estándar" },
        gourmet:  { multiplier: 1.36, label: "Menú Gourmet" },
      },

      surcharges: {
        vegetarianPerPersonCents: 250000,
        restrictionPerPersonCents: 350000,
      },

      staffing: {
        waiters: {
          perPeople: 30,
          min: 0,
        },
      },

      constraints: {
        minPeople: 10,
        maxPeople: 100,
        maxRestrictionTypes: 6,
      },
    },
  },

  /* =========================================================
     EXPERIENCIA DE GALA
  ========================================================= */
  {
    id: "experiencia-gala",
    kind: "service",
    title: "Experiencia de Gala",
    subtitle: "Servicio premium para eventos de alto nivel.",
    image: {
      src: "/assets/services/gala.jpg",
      alt: "Experiencia de Gala",
    },
    pricing: {
        kind: "TIERED_PER_PERSON",
      currency: "COP",
      model: "per_person_tiered",

      tiers: [
        { minPeople: 30,  maxPeople: 80,  unitPriceCents: 7000000 }, // 70.000
        { minPeople: 81,  maxPeople: 200, unitPriceCents: 6200000 }, // 62.000
      ],

      menus: {
        basic:    { multiplier: 1.0,  label: "Menú Básico" },
        standard: { multiplier: 1.20, label: "Menú Estándar" },
        gourmet:  { multiplier: 1.45, label: "Menú Gourmet" },
      },

      surcharges: {
        vegetarianPerPersonCents: 300000,
        restrictionPerPersonCents: 400000,
      },

      staffing: {
        waiters: {
          perPeople: 20,
          min: 3,
        },
      },

      constraints: {
        minPeople: 30,
        maxPeople: 200,
        maxRestrictionTypes: 10,
      },
    },
  },
];
