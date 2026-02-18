import type { Offering } from "../types/offering.types";

export const lunchBoxOffering: Offering = {
  id: "lunch-box",
  kind: "service",
  title: "Lunch Box",
  subtitle: "Almuerzos individuales para equipos",
  image: { src: "/assets/services/corporativos/lunch-box.jpg", alt: "Lunch Box corporativo" },

  pricing: {
    currency: "COP",
    model: "per_person_tiered",
    tiers: [
      { minPeople: 10, maxPeople: 29, unitPriceCents: 45000 * 100 },
      { minPeople: 30, maxPeople: 59, unitPriceCents: 42000 * 100 },
      { minPeople: 60, maxPeople: 200, unitPriceCents: 39000 * 100 },
    ],
    surcharges: {
      vegetarianPerPersonCents: 2000 * 100,
      restrictionPerPersonCents: 3000 * 100,
    },
    staffing: {
      waiters: { perPeople: 0, min: 0 }
    },
    menus: {
      basic:    { multiplier: 1.0,  label: "Menú Básico" },
      standard: { multiplier: 1.0,  label: "Menú Estándar" },
      gourmet:  { multiplier: 1.0,  label: "Menú Gourmet:" },
    },
    constraints: {
      minPeople: 10,
      maxPeople: 200,
      maxRestrictionTypes: 5,
    },
  },
};

export const corporateOfferings: Offering[] = [lunchBoxOffering];
