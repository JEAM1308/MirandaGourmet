import type { CartItem } from "../types/cart.types";
import type { Offering } from "../../catalog/types/offering.types";

/**
 * Códigos de validación: orientados al nuevo modelo (tiered + service selection).
 */
export type ValidationIssueCode =
  | "OFFERING_NOT_FOUND"
  | "CHECKOUT_NOT_ALLOWED"
  | "INVALID_QTY"
  | "INVALID_MENU"
  | "INVALID_PEOPLE"
  | "PEOPLE_OUT_OF_RANGE"
  | "TOO_MANY_RESTRICTION_TYPES"
  | "INVALID_DATE"
  | "LEAD_TIME_NOT_MET"
  | "REQUIRED_FIELD_MISSING"
  | "UNSUPPORTED_PRICING";

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
  itemId?: string;
  fieldId?: string; // lo dejamos por compat, aunque ahora validamos por required[]
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type OfferingsIndex = Record<string, Offering>;

function isValidISODate(value: string): boolean {
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function clampInt(n: number) {
  return Number.isFinite(n) ? Math.floor(n) : NaN;
}

function totalPeopleFromSelection(sel: CartItem["selection"]) {
  const restrictedQty = sel.people.restricted.reduce((s, r) => s + r.qty, 0);
  return sel.people.regular + sel.people.vegetarian + restrictedQty;
}

function hasRequired(offering: Offering, req: "DATE" | "ADDRESS" | "PEOPLE" | "VARIANT") {
  return (offering.required ?? []).includes(req);
}

export function validateCartForCheckout(
  items: CartItem[],
  offeringsById: OfferingsIndex,
  now: Date = new Date()
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const item of items) {
    const offering = offeringsById[item.offeringId];

    if (!offering) {
      issues.push({
        code: "OFFERING_NOT_FOUND",
        message: "Uno de los servicios del carrito ya no existe o no está disponible.",
        itemId: item.id,
      });
      continue;
    }

    // No permitir checkout si es QUOTE
    if (offering.type === "QUOTE_SERVICE" || offering.pricing.kind === "QUOTE") {
      issues.push({
        code: "CHECKOUT_NOT_ALLOWED",
        message: `“${offering.title}” requiere cotización. No se puede pagar directo.`,
        itemId: item.id,
      });
      continue;
    }

    // Solo soportamos checkout directo para TIERED_PER_PERSON en este flujo
    if (offering.pricing.kind !== "TIERED_PER_PERSON") {
      issues.push({
        code: "UNSUPPORTED_PRICING",
        message: `“${offering.title}” no está configurado para pago directo todavía.`,
        itemId: item.id,
      });
      continue;
    }

    // qty
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      issues.push({
        code: "INVALID_QTY",
        message: `La cantidad de “${offering.title}” debe ser mayor que 0.`,
        itemId: item.id,
      });
    }

    // MENU
    const menu = item.selection.menu;
    if (menu !== "basic" && menu !== "standard" && menu !== "gourmet") {
      issues.push({
        code: "INVALID_MENU",
        message: `El menú seleccionado en “${offering.title}” no es válido.`,
        itemId: item.id,
      });
    } else {
      // y además debe existir en el offering
      const menuCfg = offering.pricing.menus?.[menu];
      if (!menuCfg) {
        issues.push({
          code: "INVALID_MENU",
          message: `El menú “${menu}” no está disponible para “${offering.title}”.`,
          itemId: item.id,
        });
      }
    }

    // PEOPLE
    const reg = clampInt(item.selection.people.regular);
    const veg = clampInt(item.selection.people.vegetarian);

    if (!Number.isFinite(reg) || reg < 0 || !Number.isFinite(veg) || veg < 0) {
      issues.push({
        code: "INVALID_PEOPLE",
        message: `Las cantidades de personas en “${offering.title}” no son válidas.`,
        itemId: item.id,
      });
    }

    // Restrictions shape
    if (!Array.isArray(item.selection.people.restricted)) {
      issues.push({
        code: "INVALID_PEOPLE",
        message: `Las restricciones en “${offering.title}” no son válidas.`,
        itemId: item.id,
      });
    } else {
      // Restriction types max
      const maxTypes = offering.pricing.constraints.maxRestrictionTypes;
      if (item.selection.people.restricted.length > maxTypes) {
        issues.push({
          code: "TOO_MANY_RESTRICTION_TYPES",
          message: `Máximo ${maxTypes} tipos de restricción en “${offering.title}”.`,
          itemId: item.id,
        });
      }

      // Each restriction validity
      for (const r of item.selection.people.restricted) {
        const labelOk = typeof r.label === "string" && r.label.trim().length > 0;
        const qtyOk = Number.isFinite(r.qty) && r.qty > 0;
        if (!labelOk || !qtyOk) {
          issues.push({
            code: "INVALID_PEOPLE",
            message: `Hay restricciones inválidas en “${offering.title}” (etiqueta/cantidad).`,
            itemId: item.id,
          });
          break;
        }
      }
    }

    // Total people must be within constraints
    const totalPeople = totalPeopleFromSelection(item.selection);
    const minP = offering.pricing.constraints.minPeople;
    const maxP = offering.pricing.constraints.maxPeople;

    if (!Number.isFinite(totalPeople) || totalPeople <= 0) {
      issues.push({
        code: "INVALID_PEOPLE",
        message: `El total de personas en “${offering.title}” debe ser mayor a 0.`,
        itemId: item.id,
      });
    } else if (totalPeople < minP || totalPeople > maxP) {
      issues.push({
        code: "PEOPLE_OUT_OF_RANGE",
        message: `“${offering.title}” requiere entre ${minP} y ${maxP} personas (actual: ${totalPeople}).`,
        itemId: item.id,
      });
    }

    // Required fields: DATE / ADDRESS (según offering.required)
    if (hasRequired(offering, "DATE")) {
      const dateISO = item.selection.dateISO;
      if (!dateISO || typeof dateISO !== "string" || dateISO.trim().length === 0) {
        issues.push({
          code: "REQUIRED_FIELD_MISSING",
          message: `Falta la fecha en “${offering.title}”.`,
          itemId: item.id,
          fieldId: "DATE",
        });
      } else if (!isValidISODate(dateISO)) {
        issues.push({
          code: "INVALID_DATE",
          message: `La fecha ingresada en “${offering.title}” no es válida.`,
          itemId: item.id,
          fieldId: "DATE",
        });
      } else {
        // Lead time
        const leadHours = offering.minLeadTimeHours ?? 0;
        if (leadHours > 0) {
          const d = new Date(dateISO);
          const min = new Date(now.getTime() + leadHours * 60 * 60 * 1000);
          if (d < min) {
            issues.push({
              code: "LEAD_TIME_NOT_MET",
              message: `“${offering.title}” requiere agendar con mínimo ${leadHours}h de anticipación.`,
              itemId: item.id,
              fieldId: "DATE",
            });
          }
        }
      }
    }

    if (hasRequired(offering, "ADDRESS")) {
      const addr = item.selection.address;
      if (!addr || typeof addr !== "string" || addr.trim().length === 0) {
        issues.push({
          code: "REQUIRED_FIELD_MISSING",
          message: `Falta la dirección en “${offering.title}”.`,
          itemId: item.id,
          fieldId: "ADDRESS",
        });
      }
    }

    // Notes optional: si luego quieres maxLength, lo metemos aquí.
  }

  return { ok: issues.length === 0, issues };
}
