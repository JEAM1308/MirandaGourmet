export type OfferingKind = "service";
export type OfferingId = string;
export type Offering = {
  id: OfferingId;
  kind: OfferingKind;
  title: string;
  subtitle?: string;
  image?: { src: string; alt: string };
  minLeadTimeHours?: number;
  required?: Array<"DATE" | "ADDRESS" | "PEOPLE" | "VARIANT">;
  type?: "STANDARD_SERVICE" | "PREMIUM_SERVICE" | "QUOTE_SERVICE";
  pricing: {
    kind: "STRIPE_PRICE" | "STRIPE_VARIANTS" | "QUOTE" | "TIERED_PER_PERSON";
    currency: "COP";
    model: "per_person_tiered";
    tiers: Array<{
      minPeople: number;
      maxPeople: number;      // inclusive
      unitPriceCents: number; // price per person (base)
    }>;
    surcharges: {
      vegetarianPerPersonCents: number;
      restrictionPerPersonCents: number;
    };
    staffing: {
      waiters: {perPeople: number; min: number }
    };
    menus: {
      basic:    { multiplier: number,  label: string },
      standard: { multiplier: number,  label: string },
      gourmet:  { multiplier: number,  label: string },
    };
    constraints: {
      minPeople: number;
      maxPeople: number;
      maxRestrictionTypes: number; 
    };
  };
};

export type DietRestriction = {
  label: string; // "Sin lactosa", "Alergia a lechuga", etc.
  qty: number;
};

export type LunchBoxSelection = {
  people: {
    regular: number;
    vegetarian: number;
    restricted: DietRestriction[];
  };
  // luego: dateISO, address, notes si aplica
  notes?: string;
};

type MenuId = "basic" | "standard" | "gourmet";

export type ServiceSelection = {
  menu: MenuId;
  people: {
    regular: number;
    vegetarian: number;
    restricted: DietRestriction[];
  };
  dateISO?: string;   // opcional por ahora
  address?: string;   // opcional por ahora
  notes?: string;
};