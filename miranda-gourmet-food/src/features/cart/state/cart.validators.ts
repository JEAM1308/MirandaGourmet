import type { CartItem } from "../types/cart.types";
import type { Offering, OfferingField, OfferingSelection } from "../../catalog/types/offering.types";

export type ValidationIssueCode =
  | "OFFERING_NOT_FOUND"
  | "CHECKOUT_NOT_ALLOWED"
  | "REQUIRED_FIELD_MISSING"
  | "INVALID_RANGE"
  | "INVALID_DATE"
  | "LEAD_TIME_NOT_MET"
  | "TOO_MANY_ADDONS";

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
  itemId?: string;       // si aplica a un item del carrito
  fieldId?: string;      // si aplica a un campo específico del offering
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type OfferingsIndex = Record<string, Offering>; // key: offeringId

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

    // Validar fields del offering contra selection del item
    issues.push(...validateItemSelection(item, offering, now));
  }

  return { ok: issues.length === 0, issues };
}

function validateItemSelection(item: CartItem, offering: Offering, now: Date): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const sel = item.selection;

  for (const field of offering.fields) {
    const present = isFieldPresent(field, sel);

    if (field.required && !present) {
      issues.push({
        code: "REQUIRED_FIELD_MISSING",
        message: `Falta “${field.label}” en “${offering.title}”.`,
        itemId: item.id,
        fieldId: field.id,
      });
      continue;
    }

    // Si no está presente y no es requerido, no validamos rango
    if (!present) continue;

    // Validaciones específicas por tipo
    issues.push(...validateFieldRules(field, sel, offering, item.id, now));
  }

  // Reglas generales extra
  if (item.quantity <= 0) {
    issues.push({
      code: "INVALID_RANGE",
      message: `La cantidad de “${offering.title}” debe ser mayor que 0.`,
      itemId: item.id,
    });
  }

  return issues;
}

/**
 * Define si un campo se considera “presente” en la selección.
 * (para required fields)
 */
function isFieldPresent(field: OfferingField, selection: OfferingSelection): boolean {
  switch (field.type) {
    case "PEOPLE":
      return typeof selection.people === "number";
    case "DATE":
      return typeof selection.dateISO === "string" && selection.dateISO.trim().length > 0;
    case "ADDRESS":
      return typeof selection.address === "string" && selection.address.trim().length > 0;
    case "NOTES":
      return typeof selection.notes === "string" && selection.notes.trim().length > 0;
    case "ADDONS":
      return Array.isArray(selection.addonIds);
    case "VARIANT":
      return typeof selection.variantId === "string" && selection.variantId.trim().length > 0;
    default:
      return false;
  }
}

function validateFieldRules(
  field: OfferingField,
  selection: OfferingSelection,
  offering: Offering,
  itemId: string,
  now: Date
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  switch (field.type) {
    case "PEOPLE": {
      const people = selection.people as number;
      if (Number.isNaN(people) || !Number.isFinite(people)) {
        issues.push({
          code: "INVALID_RANGE",
          message: `“${field.label}” debe ser un número válido.`,
          itemId,
          fieldId: field.id,
        });
        break;
      }
      if (field.min !== undefined && people < field.min) {
        issues.push({
          code: "INVALID_RANGE",
          message: `“${field.label}” debe ser al menos ${field.min}.`,
          itemId,
          fieldId: field.id,
        });
      }
      if (field.max !== undefined && people > field.max) {
        issues.push({
          code: "INVALID_RANGE",
          message: `“${field.label}” no puede ser mayor a ${field.max}.`,
          itemId,
          fieldId: field.id,
        });
      }
      break;
    }

    case "DATE": {
      const dateISO = selection.dateISO as string;
      const d = new Date(dateISO);

      if (Number.isNaN(d.getTime())) {
        issues.push({
          code: "INVALID_DATE",
          message: `La fecha ingresada en “${offering.title}” no es válida.`,
          itemId,
          fieldId: field.id,
        });
        break;
      }

      // Lead time mínimo (si aplica)
      const leadHours = offering.minLeadTimeHours ?? 0;
      if (leadHours > 0) {
        const min = new Date(now.getTime() + leadHours * 60 * 60 * 1000);
        if (d < min) {
          issues.push({
            code: "LEAD_TIME_NOT_MET",
            message: `“${offering.title}” requiere agendar con mínimo ${leadHours}h de anticipación.`,
            itemId,
            fieldId: field.id,
          });
        }
      }

      // minDateISO opcional del field
      if (field.minDateISO) {
        const minD = new Date(field.minDateISO);
        if (!Number.isNaN(minD.getTime()) && d < minD) {
          issues.push({
            code: "INVALID_DATE",
            message: `“${field.label}” no puede ser anterior a la fecha permitida.`,
            itemId,
            fieldId: field.id,
          });
        }
      }

      break;
    }

    case "ADDONS": {
      const addonIds = (selection.addonIds ?? []) as string[];
      if (!Array.isArray(addonIds)) break;

      if (field.maxSelected !== undefined && addonIds.length > field.maxSelected) {
        issues.push({
          code: "TOO_MANY_ADDONS",
          message: `Puedes seleccionar máximo ${field.maxSelected} adicionales en “${offering.title}”.`,
          itemId,
          fieldId: field.id,
        });
      }
      break;
    }

    case "NOTES": {
      const notes = (selection.notes ?? "") as string;
      if (field.maxLength !== undefined && notes.length > field.maxLength) {
        issues.push({
          code: "INVALID_RANGE",
          message: `Las notas en “${offering.title}” no pueden exceder ${field.maxLength} caracteres.`,
          itemId,
          fieldId: field.id,
        });
      }
      break;
    }

    case "VARIANT": {
      const variantId = selection.variantId as string;
      const exists = field.options.some((o) => o.id === variantId);
      if (!exists) {
        issues.push({
          code: "INVALID_RANGE",
          message: `La variante seleccionada en “${offering.title}” no es válida.`,
          itemId,
          fieldId: field.id,
        });
      }
      break;
    }

    case "ADDRESS":
      // aquí podríamos validar cobertura (zona/ciudad) después
      break;
  }

  return issues;
}
