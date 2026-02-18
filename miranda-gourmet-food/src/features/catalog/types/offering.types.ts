export type OfferingKind = "service";

export type OfferingId = string;

export type Offering = {
  id: OfferingId;
  kind: OfferingKind;
  title: string;
  subtitle?: string;
  image?: { src: string; alt: string };

  pricing: {
    currency: "COP";
    model: "per_person_tiered";
    tiers: Array<{
      minPeople: number;
      maxPeople: number; // inclusive
      unitPriceCents: number; // price per person (base)
    }>;
    surcharges: {
      vegetarianPerPersonCents: number;
      restrictionPerPersonCents: number;
    };
    constraints: {
      minPeople: number;
      maxPeople: number;
      maxRestrictionTypes: number; // e.g. 5
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
