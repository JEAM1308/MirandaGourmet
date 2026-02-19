import { useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Modal, Row } from "react-bootstrap";

import type { Offering } from "../types/offering.types";
import type { MenuId, ServiceSelection } from "../pricing/servicePricing";
import { priceService } from "../pricing/servicePricing";
import { parseServiceSelection } from "../validators/serviceSelection.validator";


type ServiceId =
  | "lunch-box"
  | "eventos-masivos"
  | "entrega-empresarial"
  | "experiencia-gala";

type Props = {
  offeringsById: Record<string, Offering>;
  activeServiceId: ServiceId | null;
  onClose: () => void;

  onAddToCart: (payload: {
    offering: Offering;
    quantity: number;
    selection: ServiceSelection;
    pricing: {
      totalCents: number;
      unitPriceCents: number;
      waitersRequired: number;
      totalPeople: number;
    };
  }) => void;
};

function formatCOPFromCents(amountCents: number) {
  const amount = amountCents / 100;
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function initialSelectionFor(offering: Offering): ServiceSelection {
  const minPeople = offering.pricing.constraints.minPeople;

  return {
    menu: "standard",
    people: {
      regular: minPeople,
      vegetarian: 0,
      restricted: [],
    },
    notes: "",
  };
}

export default function ServiceModals({
  offeringsById,
  activeServiceId,
  onClose,
  onAddToCart,
}: Props) {
  const offering = activeServiceId ? offeringsById[activeServiceId] : undefined;

  
    const [sel, setSel] = useState<ServiceSelection | null>(() => {
        return offering ? initialSelectionFor(offering) : null;
    });
  const [restrictionLabel, setRestrictionLabel] = useState("");
  const [restrictionQty, setRestrictionQty] = useState(1);

  const pricing = useMemo(() => {
    if (!offering || !sel) return null;
    return priceService(offering, sel);
  }, [offering, sel]);

  const minPeople = offering?.pricing.constraints.minPeople ?? 0;
  const maxPeople = offering?.pricing.constraints.maxPeople ?? 0;

  const totalPeople = useMemo(() => {
    if (!sel) return 0;
    const restrictedQtySum = sel.people.restricted.reduce((s, r) => s + r.qty, 0);
    return sel.people.regular + sel.people.vegetarian + restrictedQtySum;
  }, [sel]);

  const canAddRestriction =
    restrictionLabel.trim().length > 0 &&
    Number.isFinite(restrictionQty) &&
    restrictionQty > 0;

  const onChangeMenu = (menu: MenuId) => {
    if (!sel) return;
    setSel({ ...sel, menu });
  };

  const onChangeRegular = (n: number) => {
    if (!offering || !sel) return;
    const next = clampInt(n, 0, maxPeople);
    setSel({ ...sel, people: { ...sel.people, regular: next } });
  };

  const onChangeVegetarian = (n: number) => {
    if (!offering || !sel) return;
    const next = clampInt(n, 0, maxPeople);
    setSel({ ...sel, people: { ...sel.people, vegetarian: next } });
  };

  const onNotes = (notes: string) => {
    if (!sel) return;
    setSel({ ...sel, notes });
  };

  const onAddRestriction = () => {
    if (!sel || !offering) return;
    if (!canAddRestriction) return;

    const label = restrictionLabel.trim();
    const qty = clampInt(restrictionQty, 1, maxPeople);

    const maxTypes = offering.pricing.constraints.maxRestrictionTypes;
    if (sel.people.restricted.length >= maxTypes) return;

    setSel({
      ...sel,
      people: {
        ...sel.people,
        restricted: [...sel.people.restricted, { label, qty }],
      },
    });

    setRestrictionLabel("");
    setRestrictionQty(1);
  };

  const onRemoveRestriction = (idx: number) => {
    if (!sel) return;
    setSel({
      ...sel,
      people: {
        ...sel.people,
        restricted: sel.people.restricted.filter((_, i) => i !== idx),
      },
    });
  };

  const onSubmitAddToCart = () => {
    if (!offering || !sel) return;

    const parsed = parseServiceSelection(sel);
    if (!parsed.ok) {
      alert(parsed.error);
      return;
    }

    const priced = priceService(offering, parsed.value);
    if (!priced.ok) {
      alert(priced.error);
      return;
    }

    onAddToCart({
      offering,
      quantity: 1,
      selection: parsed.value,
      pricing: {
        totalCents: priced.value.totalCents,
        unitPriceCents: priced.value.unitPriceCents,
        waitersRequired: priced.value.waitersRequired,
        totalPeople: priced.value.totalPeople,
      },
    });

    onClose();
  };

  const show = Boolean(activeServiceId && offering && sel);

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      scrollable
      dialogClassName="svcModalDialog"
      contentClassName="svcModal"
      backdropClassName="svcModalBackdrop"
    >
      <Modal.Header closeButton className="svcModalHeader">
        <Modal.Title className="svcModalTitle">
          {offering?.title ?? "Servicio"}
          {offering && (
            <Badge className="svcPill ms-2">
              {minPeople}–{maxPeople} personas
            </Badge>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="svcModalBody">
        {offering?.subtitle && <div className="svcSubtitle">{offering.subtitle}</div>}

        {offering?.image?.src && (
          <div className="svcHero">
            <img
              src={offering.image.src}
              alt={offering.image.alt ?? offering.title}
              className="svcHeroImg"
            />
            <div className="svcHeroOverlay" />
          </div>
        )}

        {/* MENU */}
        <div className="svcBlock">
          <div className="svcBlockTitle">Escoge el Menú</div>
          <Row className="g-2">
            {(["basic", "standard", "gourmet"] as const).map((m) => (
              <Col xs={12} md={4} key={m}>
                <Button
                  variant={sel?.menu === m ? "warning" : "outline-secondary"}
                  className="w-100"
                  onClick={() => onChangeMenu(m)}
                >
                  {offering?.pricing.menus[m]?.label ?? m}
                </Button>
              </Col>
            ))}
          </Row>
        </div>

        {/* PEOPLE */}
        <div className="svcBlock">
          <div className="svcBlockTitle">Número de personas</div>
          <Row className="g-2">
            <Col xs={12} md={6}>
              <Form.Label className="text-muted small">Sin restricción</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={sel?.people.regular ?? 0}
                onChange={(e) => onChangeRegular(Number(e.target.value))}
              />
            </Col>

            <Col xs={12} md={6}>
              <Form.Label className="text-muted small">Vegetarianos</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={sel?.people.vegetarian ?? 0}
                onChange={(e) => onChangeVegetarian(Number(e.target.value))}
              />
            </Col>
          </Row>

          <div className="svcMeta">
            Total personas: <span className="svcStrong">{totalPeople}</span>
          </div>
        </div>

        {/* RESTRICTIONS */}
        <div className="svcBlock">
          <div className="svcBlockTitle">Restricciones</div>

          <Row className="g-2 align-items-end">
            <Col xs={12} md={7}>
              <Form.Label className="text-muted small">Etiqueta</Form.Label>
              <Form.Control
                placeholder='Ej: "Sin lactosa", "Alergia a lechuga"'
                value={restrictionLabel}
                onChange={(e) => setRestrictionLabel(e.target.value)}
              />
            </Col>
            <Col xs={12} md={3}>
              <Form.Label className="text-muted small">Cantidad</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={restrictionQty}
                onChange={(e) => setRestrictionQty(Number(e.target.value))}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button
                variant="outline-dark"
                className="w-100"
                onClick={onAddRestriction}
                disabled={
                  !canAddRestriction ||
                  !offering ||
                  (sel?.people.restricted.length ?? 0) >=
                    (offering?.pricing.constraints.maxRestrictionTypes ?? 0)
                }
              >
                Añadir
              </Button>
            </Col>
          </Row>

          {sel && sel.people.restricted.length > 0 && (
            <div className="svcChips mt-3">
              {sel.people.restricted.map((r, idx) => (
                <div key={`${r.label}-${idx}`} className="svcChip">
                  <div>
                    <div className="svcStrong">{r.label}</div>
                    <div className="svcMuted">{r.qty} persona(s)</div>
                  </div>
                  <Button variant="outline-danger" size="sm" onClick={() => onRemoveRestriction(idx)}>
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NOTES */}
        <div className="svcBlock">
          <Form.Label className="svcBlockTitle">Notas</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ej: horario, accesos, observaciones..."
            value={sel?.notes ?? ""}
            onChange={(e) => onNotes(e.target.value)}
          />
        </div>

        {/* PRICING */}
        <div className="svcSummary">
          <div className="svcSummaryTop">
            <div className="svcBlockTitle mb-0">Resumen</div>
            {pricing?.ok && <Badge className="svcPillDark">Meseros mín.: {pricing.value.waitersRequired}</Badge>}
          </div>

          {!pricing ? (
            <div className="svcMuted">Cargando…</div>
          ) : pricing.ok ? (
            <>
              <div className="svcRow">
                <span className="svcMuted">Precio por persona (con menú)</span>
                <span className="svcMuted">{formatCOPFromCents(pricing.value.unitPriceCents)}</span>
              </div>

              <div className="svcRow">
                <span className="svcMuted">Subtotal base</span>
                <span className="svcMuted">{formatCOPFromCents(pricing.value.baseSubtotalCents)}</span>
              </div>

              <div className="svcRow">
                <span className="svcMuted">Recargo vegetarianos</span>
                <span className="svcMuted">{formatCOPFromCents(pricing.value.vegExtraCents)}</span>
              </div>

              <div className="svcRow">
                <span className="svcMuted">Recargo restricciones</span>
                <span className="svcMuted">{formatCOPFromCents(pricing.value.restExtraCents)}</span>
              </div>

              <hr className="svcHr" />

              <div className="svcRow svcTotal">
                <span>Total</span>
                <span>{formatCOPFromCents(pricing.value.totalCents)}</span>
              </div>
            </>
          ) : (
            <Alert variant="warning" className="mb-0">
              {pricing.error}
            </Alert>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="svcModalFooter">
        <Button variant="outline-secondary" onClick={onClose}>
          Cancelar
        </Button>

        <Button variant="dark" onClick={onSubmitAddToCart} disabled={!pricing || !pricing.ok}>
          Agregar al carrito
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
