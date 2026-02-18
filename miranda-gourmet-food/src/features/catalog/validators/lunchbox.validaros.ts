import type { LunchBoxSelection, Offering } from "../types/offering.types";

export type ValidationIssue = { code: string; message: string };
export type ValidationResult = { ok: true } | { ok: false; issues: ValidationIssue[] };

export function validateLunchBox(offering: Offering, sel: LunchBoxSelection): ValidationResult {
  const issues: ValidationIssue[] = [];

  const restrictedQty = sel.people.restricted.reduce((sum, r) => sum + r.qty, 0);
  const people = sel.people.regular + sel.people.vegetarian + restrictedQty;

  if (people < offering.pricing.constraints.minPeople) {
    issues.push({
      code: "MIN_PEOPLE",
      message: `Mínimo ${offering.pricing.constraints.minPeople} personas para Lunch Box.`,
    });
  }

  if (people > offering.pricing.constraints.maxPeople) {
    issues.push({
      code: "MAX_PEOPLE",
      message: `Máximo ${offering.pricing.constraints.maxPeople} personas para Lunch Box.`,
    });
  }

  if (sel.people.regular < 0 || sel.people.vegetarian < 0) {
    issues.push({ code: "NEGATIVE", message: "Las cantidades no pueden ser negativas." });
  }

  if (sel.people.restricted.length > offering.pricing.constraints.maxRestrictionTypes) {
    issues.push({
      code: "MAX_RESTRICTIONS",
      message: `Máximo ${offering.pricing.constraints.maxRestrictionTypes} tipos de restricción.`,
    });
  }

  for (const r of sel.people.restricted) {
    if (!r.label || r.label.trim().length < 3) {
      issues.push({ code: "RESTR_LABEL", message: "Cada restricción debe tener un nombre válido." });
      break;
    }
    if (!Number.isInteger(r.qty) || r.qty <= 0) {
      issues.push({ code: "RESTR_QTY", message: "La cantidad de cada restricción debe ser > 0." });
      break;
    }
  }

  return issues.length ? { ok: false, issues } : { ok: true };
}
