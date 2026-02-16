/*
.       TIPOS BASE
*/
export type OfferingType =
  | "STANDARD_SERVICE"
  | "PREMIUM_SERVICE"
  | "QUOTE_SERVICE";

export type Money = {
  currency: "COP" | "USD";
  amountCents: number; 
};

export type OfferingStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
/*
.       Opciones configurables
*/
export type OfferingFieldType =
  | "PEOPLE"        // número de personas
  | "DATE"          // fecha (o fecha/hora)
  | "ADDRESS"       // dirección
  | "NOTES"         // notas libres
  | "ADDONS"        // selección múltiple
  | "VARIANT";      // variante (p.ej. Lunch Box: standard/premium)

export type OfferingFieldBase = {
  id: string;                 // "people" | "date" | "address" ...
  type: OfferingFieldType;
  label: string;              // texto UI
  required: boolean;
  helpText?: string;
};

export type PeopleField = OfferingFieldBase & {
  type: "PEOPLE";
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
};

export type DateField = OfferingFieldBase & {
  type: "DATE";
  mode: "DATE" | "DATETIME";
  minDateISO?: string;        // validación simple en frontend
};

export type AddressField = OfferingFieldBase & {
  type: "ADDRESS";
  coverage?: "CITY" | "ZONE"; // opcional: restringir entregas
};

export type NotesField = OfferingFieldBase & {
  type: "NOTES";
  maxLength?: number;
};

export type AddonsField = OfferingFieldBase & {
  type: "ADDONS";
  options: Array<{
    id: string;
    name: string;
    description?: string;
    // add-on puede tener priceId propio o precio estimado
    stripePriceId?: string;
    price?: Money;
  }>;
  maxSelected?: number;
};

export type VariantField = OfferingFieldBase & {
  type: "VARIANT";
  options: Array<{
    id: string;
    name: string;
    description?: string;
    stripePriceId?: string;  // si cada variante tiene su price
    price?: Money;           // estimado para UI
  }>;
};

export type OfferingField =
  | PeopleField
  | DateField
  | AddressField
  | NotesField
  | AddonsField
  | VariantField;
/*
.       Stripe pricing strategy
*/
export type PricingModel =
  | { kind: "STRIPE_PRICE"; stripePriceId: string } // 1 precio base
  | { kind: "STRIPE_VARIANTS"; fieldId: string }    // usa el VariantField seleccionado
  | { kind: "QUOTE" };                              // no checkout directo

/*
.       Stripe pricing strategy
*/

export type Offering = {
  id: string;
  slug: string;

  status: OfferingStatus;
  type: OfferingType;

  title: string;
  shortDescription: string;
  description?: string;

  images: Array<{
    src: string;
    alt: string;
  }>;

  tags?: string[]; // "corporativo", "familiar", "gala"

  // Campos que el cliente debe llenar
  fields: OfferingField[];

  // Cómo se cobra
  pricing: PricingModel;

  // UI/operación
  minLeadTimeHours?: number; // ej: mínimo 24h antes
  availableAreas?: string[]; // opcional: zonas de entrega
};

/*
.       Qué captura el usuario
*/

export type OfferingSelection = {
  offeringId: string;

  // variante escogida si existe
  variantId?: string;

  // inputs
  people?: number;
  dateISO?: string;
  address?: string;
  notes?: string;

  // add-ons
  addonIds?: string[];
};
