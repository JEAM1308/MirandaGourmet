export type CorporateServiceId =
  | "lunch-box"
  | "eventos-masivos"
  | "eventos-gala"
  | "entrega-empresarial";

export type CorporateService = {
  id: CorporateServiceId;
  label: string;
  subtitle: string;
  bullets: string[];
  image?: { src: string; alt: string };
};

export const CORPORATE_SERVICES: CorporateService[] = [
  {
    id: "lunch-box",
    label: "Lunch Box",
    subtitle: "Almuerzos individuales para equipos",
    bullets: ["Porciones balanceadas", "Opciones vegetarianas", "Entrega programada"],
    image: { src: "/assets/services/corporativos/lunch-box.jpg", alt: "Lunch Box corporativo" },
  },
  {
    id: "eventos-masivos",
    label: "Eventos Masivos",
    subtitle: "Grandes volúmenes con control y logística",
    bullets: ["Estaciones de servicio", "Control de cantidades", "Equipo de apoyo"],
    image: { src: "/assets/services/corporativos/eventos-masivos.jpg", alt: "Eventos masivos" },
  },
  {
    id: "eventos-gala",
    label: "Eventos de Gala",
    subtitle: "Recepciones ejecutivas y experiencias premium",
    bullets: ["Canapés + bebidas", "Presentación sobria", "Opcional: personal"],
    image: { src: "/assets/services/corporativos/eventos-gala.jpg", alt: "Eventos de gala" },
  },
  {
    id: "entrega-empresarial",
    label: "Entrega Empresarial",
    subtitle: "Catering recurrente para oficina",
    bullets: ["Planes recurrentes", "Coordinación administrativa", "Entrega a salas/pisos"],
    image: { src: "/assets/services/corporativos/entrega-empresarial.jpg", alt: "Entrega empresarial" },
  },
];

export function isCorporateServiceId(x: string): x is CorporateServiceId {
  return CORPORATE_SERVICES.some((s) => s.id === x);
}
