import { useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { BsPlusLg, BsTrash } from "react-icons/bs";

import { useCart } from "../../cart/hooks/useCart";
import type { DietRestriction, LunchBoxSelection, Offering } from "../types/offering.types";
import { validateLunchBox } from "../validators/lunchbox.validaros";
import { priceLunchBox } from "../pricing/lunchbox.pricing";

type Props = {
  show: boolean;
  onHide: () => void;
  offering: Offering; // lunchBoxOffering
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function formatCOPFromCents(amountCents: number) {
  const amount = amountCents / 100;
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function totalPeople(sel: LunchBoxSelection): number {
  const restrictedQty = sel.people.restricted.reduce((sum, r) => sum + r.qty, 0);
  return sel.people.regular + sel.people.vegetarian + restrictedQty;
}

export default function LunchBoxOrderModal({ show, onHide, offering }: Props) {
  const { dispatch } = useCart();

  const [sel, setSel] = useState<LunchBoxSelection>({
    people: { regular: 10, vegetarian: 0, restricted: [] },
    notes: "",
  });

  const validation = useMemo(() => validateLunchBox(offering, sel), [offering, sel]);
  const breakdown = useMemo(() => priceLunchBox(offering, sel), [offering, sel]);

  const peopleTotal = useMemo(() => totalPeople(sel), [sel]);

  const setRegular = (value: number) => {
    setSel((prev) => ({
      ...prev,
      people: { ...prev.people, regular: clampInt(value, 0, offering.pricing.constraints.maxPeople) },
    }));
  };

  const setVegetarian = (value: number) => {
    setSel((prev) => ({
      ...prev,
      people: { ...prev.people, vegetarian: clampInt(value, 0, offering.pricing.constraints.maxPeople) },
    }));
  };

  const addRestriction = () => {
    setSel((prev) => {
      const maxTypes = offering.pricing.constraints.maxRestrictionTypes;
      if (prev.people.restricted.length >= maxTypes) return prev;

      const next: DietRestriction = { label: "", qty: 1 };
      return {
        ...prev,
        people: { ...prev.people, restricted: [...prev.people.restricted, next] },
      };
    });
  };

  const updateRestriction = (idx: number, patch: Partial<DietRestriction>) => {
    setSel((prev) => {
      const list = prev.people.restricted.map((r, i) => (i === idx ? { ...r, ...patch } : r));
      return { ...prev, people: { ...prev.people, restricted: list } };
    });
  };

  const removeRestriction = (idx: number) => {
    setSel((prev) => {
      const list = prev.people.restricted.filter((_, i) => i !== idx);
      return { ...prev, people: { ...prev.people, restricted: list } };
    });
  };

  const canAddToCart = validation.ok && breakdown.totalCents > 0;

  const onAddToCart = () => {
    if (!canAddToCart) return;

    dispatch({
      type: "ADD_ITEM",
      payload: {
        offeringId: offering.id,
        title: offering.title,
        image: offering.image,
        unitLabel: "Pedido",
        estimatedUnitPriceCents: breakdown.totalCents, // total del pedido
        selection: sel, // 👈 se guarda el desglose
        quantity: 1,
      },
    });

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="lb-modal">
      <Modal.Header closeButton closeVariant="white" className="lb-modalHeader">
        <Modal.Title className="lb-modalTitle">
          Pedir {offering.title}{" "}
          <span className="lb-modalSub">— {offering.subtitle ?? "Almuerzos corporativos"}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="lb-modalBody">
        {/* Header visual */}
        <div className="lb-hero">
          {offering.image?.src ? (
            <img className="lb-heroImg" src={offering.image.src} alt={offering.image.alt ?? offering.title} />
          ) : (
            <div className="lb-heroImg" />
          )}
          <div className="lb-heroOverlay" />

          <div className="lb-heroMeta">
            <div className="lb-kicker">Configuración del pedido</div>
            <div className="lb-people">
              Total: <strong>{peopleTotal}</strong> personas
            </div>
          </div>
        </div>

        {/* Validaciones */}
        {!validation.ok && (
          <Alert variant="warning" className="mt-3">
            <div className="fw-semibold mb-1">Revisa esto:</div>
            <ul className="mb-0">
              {validation.issues.map((i, idx) => (
                <li key={`${i.code}-${idx}`}>{i.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Row className="g-3 mt-1">
          {/* Cantidades */}
          <Col md={6}>
            <div className="lb-sectionTitle">Personas</div>

            <div className="lb-field">
              <Form.Label className="lb-label">Normales</Form.Label>
              <Form.Control
                value={sel.people.regular}
                inputMode="numeric"
                onChange={(e) => setRegular(Number(e.target.value))}
              />
            </div>

            <div className="lb-field">
              <Form.Label className="lb-label">Vegetarianos</Form.Label>
              <Form.Control
                value={sel.people.vegetarian}
                inputMode="numeric"
                onChange={(e) => setVegetarian(Number(e.target.value))}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between mt-3">
              <div className="lb-sectionTitle mb-0">Restricciones</div>

              <Button
                variant="outline-light"
                size="sm"
                className="lb-addBtn"
                onClick={addRestriction}
                disabled={sel.people.restricted.length >= offering.pricing.constraints.maxRestrictionTypes}
              >
                <BsPlusLg className="me-1" /> Agregar
              </Button>
            </div>

            {sel.people.restricted.length === 0 ? (
              <div className="text-muted small mt-2">Opcional. Ej: “Sin lactosa”, “Alergia a maní”.</div>
            ) : (
              <div className="lb-restrictions mt-2">
                {sel.people.restricted.map((r, idx) => (
                  <div className="lb-restrRow" key={`${idx}`}>
                    <Form.Control
                      placeholder="Restricción (ej: Sin lactosa)"
                      value={r.label}
                      onChange={(e) => updateRestriction(idx, { label: e.target.value })}
                    />

                    <Form.Control
                      style={{ maxWidth: 110 }}
                      inputMode="numeric"
                      value={r.qty}
                      onChange={(e) => updateRestriction(idx, { qty: clampInt(Number(e.target.value), 1, 999) })}
                    />

                    <Button
                      variant="outline-danger"
                      className="lb-trashBtn"
                      onClick={() => removeRestriction(idx)}
                      aria-label="Eliminar restricción"
                    >
                      <BsTrash />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="lb-field mt-3">
              <Form.Label className="lb-label">Notas (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={sel.notes ?? ""}
                onChange={(e) => setSel((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Indicaciones de entrega, horarios, etc."
              />
            </div>
          </Col>

          {/* Resumen precio */}
          <Col md={6}>
            <div className="lb-sectionTitle">Resumen</div>

            <div className="lb-summaryCard">
              <div className="lb-summaryRow">
                <div className="text-muted">Personas</div>
                <div className="fw-semibold">{peopleTotal}</div>
              </div>

              <div className="lb-summaryRow">
                <div className="text-muted">Precio base (por persona)</div>
                <div className="fw-semibold">
                  {breakdown.baseUnitPriceCents > 0 ? formatCOPFromCents(breakdown.baseUnitPriceCents) : "—"}
                </div>
              </div>

              <div className="lb-summaryRow">
                <div className="text-muted">Subtotal base</div>
                <div className="fw-semibold">{formatCOPFromCents(breakdown.baseSubtotalCents)}</div>
              </div>

              <div className="lb-summaryRow">
                <div className="text-muted">Recargo vegetarianos</div>
                <div className="fw-semibold">{formatCOPFromCents(breakdown.vegetarianSurchargeCents)}</div>
              </div>

              <div className="lb-summaryRow">
                <div className="text-muted">Recargo restricciones</div>
                <div className="fw-semibold">{formatCOPFromCents(breakdown.restrictionSurchargeCents)}</div>
              </div>

              <div className="lb-divider" />

              <div className="lb-summaryTotal">
                <div>Total estimado</div>
                <div className="lb-total">{formatCOPFromCents(breakdown.totalCents)}</div>
              </div>

              <div className="lb-hint">
                * Precio estimado. El precio final se valida en checkout según reglas del servicio.
              </div>

              {/* Chips de breakdown */}
              <div className="lb-chips">
                <Badge pill className="lb-chip">
                  Normal: {sel.people.regular}
                </Badge>
                <Badge pill className="lb-chip">
                  Veg: {sel.people.vegetarian}
                </Badge>
                <Badge pill className="lb-chip">
                  Restr.: {sel.people.restricted.reduce((s, r) => s + r.qty, 0)}
                </Badge>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="lb-modalFooter">
        <Button variant="outline-light" onClick={onHide}>
          Cancelar
        </Button>

        <Button variant="outline-warning" onClick={onAddToCart} disabled={!canAddToCart}>
          Agregar al carrito
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
