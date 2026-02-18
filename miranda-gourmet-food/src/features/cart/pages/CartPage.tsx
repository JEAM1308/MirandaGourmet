import { useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useCart } from "../hooks/useCart";
import { cartTotals } from "../state/cart.logic";
import { validateCartForCheckout } from "../state/cart.validators";

import type { Offering } from "../../catalog/types/offering.types";
import { offeringsMock } from "../../catalog/data/offerings.mock";

import { startCheckout } from "../../payments/services/payments.services";
import { env } from "../../../app/config/env";
/*
  Helper para lunch box
*/
type LunchBoxSelection = {
  people: {
    regular: number;
    vegetarian: number;
    restricted: { label: string; qty: number }[];
  };
  notes?: string;
};

function isLunchBoxSelection(sel: unknown): sel is LunchBoxSelection {
  if (!sel || typeof sel !== "object") return false;

  const maybe = sel as LunchBoxSelection;

  return (
    typeof maybe.people?.regular === "number" &&
    typeof maybe.people?.vegetarian === "number" &&
    Array.isArray(maybe.people?.restricted)
  );
}

function totalLunchBoxPeople(sel: LunchBoxSelection) {
  const restricted = sel.people.restricted.reduce((s, r) => s + r.qty, 0);
  return sel.people.regular + sel.people.vegetarian + restricted;
}

function formatCOPFromCents(amountCents: number) {
  const amount = amountCents / 100;
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const offeringsById = useMemo<Record<string, Offering>>(() => {
    const index: Record<string, Offering> = {};
    for (const o of offeringsMock) index[o.id] = o;
    return index;
  }, []);

  const validation = useMemo(() => {
    return validateCartForCheckout(state.items, offeringsById);
  }, [state.items, offeringsById]);

  const totals = useMemo(() => cartTotals(state), [state]);

  const onClear = () => dispatch({ type: "CLEAR" });

  const onCheckout = async () => {
    if (!validation.ok || state.items.length === 0) return;

    setIsCheckingOut(true);

    try {
      const { url } = await startCheckout(state.items);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("No se pudo iniciar el pago. Verifica la configuración del proveedor.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const providerLabel =
    env.paymentProvider === "wompi" ? "Pagar con Wompi" : "Pagar con Stripe";

  return (
    <section className="pageSection">
      <Container className="py-4">
        <Row className="align-items-center mb-3">
          <Col>
            <h1 className="h3 mb-0">Carrito</h1>
            <div className="text-muted">Revisa tu selección antes de pagar.</div>
          </Col>
          <Col className="text-end">
            <Button
              variant="outline-secondary"
              onClick={onClear}
              disabled={state.items.length === 0 || isCheckingOut}
            >
              Vaciar carrito
            </Button>
          </Col>
        </Row>

        {state.items.length === 0 ? (
          <Card className="p-4">
            <div className="text-center">
              <div className="h5 mb-2">Tu carrito está vacío</div>
              <div className="text-muted mb-3">
                Cuando agregues un servicio, aparecerá aquí.
              </div>

              <Link to="/" className="btn btn-primary">
                Ver catálogo
              </Link>
            </div>
          </Card>
        ) : (
          <Row className="g-3">
            <Col lg={8}>
              {!validation.ok && (
                <Alert variant="warning">
                  <div className="fw-semibold mb-2">Revisa esto antes de pagar:</div>
                  <ul className="mb-0">
                    {validation.issues.map((i, idx) => (
                      <li key={`${i.code}-${idx}`}>{i.message}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {state.items.map((item) => (
                <Card className="mb-3" key={item.id}>
                  <Card.Body>
                    <Row className="align-items-start g-3">
                      <Col xs={12} md={7}>
                        <div className="d-flex gap-3">
                          {item.image?.src ? (
                            <img
                              src={item.image.src}
                              alt={item.image.alt ?? item.title}
                              style={{
                                width: 72,
                                height: 72,
                                objectFit: "cover",
                                borderRadius: 12,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 72,
                                height: 72,
                                borderRadius: 12,
                                background: "#eee",
                              }}
                            />
                          )}

                          <div>
                            <div className="fw-semibold">{item.title}</div>
                            <div className="text-muted small">
                              {item.unitLabel ? `Unidad: ${item.unitLabel}` : "Servicio"}
                            </div>

                            <div className="small mt-2">
                              {isLunchBoxSelection(item.selection) ? (
                                <>
                                  <div>
                                    <span className="text-muted">Total personas:</span>{" "}
                                    <span className="fw-semibold">
                                      {totalLunchBoxPeople(item.selection)}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-muted">Normales:</span>{" "}
                                    <span className="fw-semibold">
                                      {item.selection.people.regular}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-muted">Vegetarianos:</span>{" "}
                                    <span className="fw-semibold">
                                      {item.selection.people.vegetarian}
                                    </span>
                                  </div>

                                  {item.selection.people.restricted.length > 0 && (
                                    <div className="mt-1">
                                      <span className="text-muted">Restricciones:</span>
                                      <ul className="mb-0 ps-3">
                                        {item.selection.people.restricted.map((r, idx) => (
                                          <li key={`${r.label}-${idx}`}>
                                            {r.label} ({r.qty})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {item.selection.notes && (
                                    <div className="mt-1">
                                      <span className="text-muted">Notas:</span>{" "}
                                      <span className="fw-semibold">{item.selection.notes}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* fallback para otros servicios */}
                                  {item.selection.variantId && (
                                    <div>
                                      <span className="text-muted">Variante:</span>{" "}
                                      <span className="fw-semibold">
                                        {item.selection.variantId}
                                      </span>
                                    </div>
                                  )}

                                  {typeof item.selection.people === "number" && (
                                    <div>
                                      <span className="text-muted">Personas:</span>{" "}
                                      <span className="fw-semibold">
                                        {item.selection.people}
                                      </span>
                                    </div>
                                  )}

                                  {item.selection.dateISO && (
                                    <div>
                                      <span className="text-muted">Fecha:</span>{" "}
                                      <span className="fw-semibold">
                                        {item.selection.dateISO}
                                      </span>
                                    </div>
                                  )}

                                  {item.selection.address && (
                                    <div>
                                      <span className="text-muted">Dirección:</span>{" "}
                                      <span className="fw-semibold">
                                        {item.selection.address}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Col>

                      <Col xs={12} md={2}>
                        <Form.Label className="text-muted small mb-1">
                          Cantidad
                        </Form.Label>
                        <div className="d-flex gap-2 align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              dispatch({
                                type: "DECREMENT",
                                payload: { id: item.id },
                              })
                            }
                            disabled={isCheckingOut}
                          >
                            −
                          </Button>

                          <Form.Control
                            size="sm"
                            value={item.quantity}
                            onChange={(e) =>
                              dispatch({
                                type: "SET_QTY",
                                payload: {
                                  id: item.id,
                                  quantity: Number(e.target.value),
                                },
                              })
                            }
                            inputMode="numeric"
                          />

                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              dispatch({
                                type: "INCREMENT",
                                payload: { id: item.id },
                              })
                            }
                            disabled={isCheckingOut}
                          >
                            +
                          </Button>
                        </div>
                      </Col>

                      <Col xs={12} md={3} className="text-md-end">
                        <div className="text-muted small mb-1">Subtotal</div>
                        <div className="fw-semibold">
                          {formatCOPFromCents(
                            (item.estimatedUnitPriceCents ?? 0) *
                              item.quantity
                          )}
                        </div>

                        <Button
                          variant="link"
                          className="px-0 mt-2"
                          onClick={() =>
                            dispatch({
                              type: "REMOVE_ITEM",
                              payload: { id: item.id },
                            })
                          }
                          disabled={isCheckingOut}
                        >
                          Quitar
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Col>

            <Col lg={4}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-muted">Subtotal estimado</div>
                    <div className="fw-semibold">
                      {formatCOPFromCents(totals.subtotalCents)}
                    </div>
                  </div>

                  <div className="text-muted small mb-3">
                    El total final se calcula en el checkout según precios oficiales.
                  </div>

                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={onCheckout}
                    disabled={
                      !validation.ok ||
                      state.items.length === 0 ||
                      isCheckingOut
                    }
                  >
                    {isCheckingOut ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Iniciando pago…
                      </>
                    ) : (
                      providerLabel
                    )}
                  </Button>

                  <Link
                    to="/"
                    className="btn btn-outline-secondary w-100 mt-2"
                  >
                    Seguir comprando
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
}
