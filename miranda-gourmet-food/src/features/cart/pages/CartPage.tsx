import { useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useCart } from "../hooks/useCart";
import { cartTotals } from "../state/cart.logic";
import { validateCartForCheckout } from "../state/cart.validators";

import type { Offering } from "../../catalog/types/offering.types";
import { offeringsMock } from "../../catalog/data/offerings.mock";

import { startCheckout } from "../../payments/services/payments.services";
import { env } from "../../../app/config/env";

function formatCOPFromCents(amountCents: number) {
  const amount = amountCents / 100;
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function totalPeople(selection: {
  people: { regular: number; vegetarian: number; restricted: { qty: number }[] };
}) {
  const restrictedQty = selection.people.restricted.reduce((s, r) => s + r.qty, 0);
  return selection.people.regular + selection.people.vegetarian + restrictedQty;
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
    <section className="cart-page">
      <Container>
        {/* Header */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title h3">Carrito</h1>
            <div className="cart-subtitle">Revisa tu selección antes de pagar.</div>
          </div>

          <div>
            <Button
              variant="outline-secondary"
              onClick={onClear}
              disabled={state.items.length === 0 || isCheckingOut}
            >
              Vaciar carrito
            </Button>
          </div>
        </div>

        {/* Empty */}
        {state.items.length === 0 ? (
          <div className="cart-panel">
            <div className="cart-panel-body cart-empty">
              <h2>Tu carrito está vacío</h2>
              <div className="mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                Cuando agregues un servicio, aparecerá aquí.
              </div>

              <Link to="/" className="btn btn-outline-warning btn-lg">
                Ver catálogo
              </Link>
            </div>
          </div>
        ) : (
          <Row className="g-3">
            {/* Items */}
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
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-body">
                    <div className="cart-item-row">
                      {/* Left */}
                      <div className="cart-item-left">
                        {item.image?.src ? (
                          <img
                            src={item.image.src}
                            alt={item.image.alt ?? item.title}
                            className="cart-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <div className="cart-thumb" />
                        )}

                        <div>
                          <div className="cart-item-title">{item.title}</div>
                          <div className="cart-item-meta">
                            {item.unitLabel ? `Unidad: ${item.unitLabel}` : "Servicio"}
                          </div>

                          {/* ✅ selection SIEMPRE es ServiceSelection */}
                          <div className="cart-item-details">
                            <div>
                              <span className="muted">Menú:</span>{" "}
                              <strong>{item.selection.menu}</strong>
                            </div>

                            <div>
                              <span className="muted">Total personas:</span>{" "}
                              <strong>{totalPeople(item.selection)}</strong>
                            </div>

                            <div>
                              <span className="muted">Normales:</span>{" "}
                              <strong>{item.selection.people.regular}</strong>
                            </div>

                            <div>
                              <span className="muted">Vegetarianos:</span>{" "}
                              <strong>{item.selection.people.vegetarian}</strong>
                            </div>

                            {item.selection.people.restricted.length > 0 && (
                              <div className="mt-1">
                                <span className="muted">Restricciones:</span>
                                <ul className="mb-0 ps-3">
                                  {item.selection.people.restricted.map((r, idx) => (
                                    <li key={`${r.label}-${idx}`}>
                                      {r.label} ({r.qty})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.selection.dateISO && (
                              <div className="mt-1">
                                <span className="muted">Fecha:</span>{" "}
                                <strong>{item.selection.dateISO}</strong>
                              </div>
                            )}

                            {item.selection.address && (
                              <div className="mt-1">
                                <span className="muted">Dirección:</span>{" "}
                                <strong>{item.selection.address}</strong>
                              </div>
                            )}

                            {item.selection.notes && (
                              <div className="mt-1">
                                <span className="muted">Notas:</span>{" "}
                                <strong>{item.selection.notes}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Qty */}
                      <div>
                        <div className="cart-qty-label">Cantidad</div>
                        <div className="cart-qty">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => dispatch({ type: "DECREMENT", payload: { id: item.id } })}
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
                                payload: { id: item.id, quantity: Number(e.target.value) },
                              })
                            }
                            inputMode="numeric"
                          />

                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => dispatch({ type: "INCREMENT", payload: { id: item.id } })}
                            disabled={isCheckingOut}
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          variant="link"
                          className="cart-remove"
                          onClick={() => dispatch({ type: "REMOVE_ITEM", payload: { id: item.id } })}
                          disabled={isCheckingOut}
                        >
                          Quitar
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="cart-price">
                        <div className="label">Subtotal</div>
                        <div className="value">
                          {formatCOPFromCents((item.estimatedUnitPriceCents ?? 0) * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Col>

            {/* Summary */}
            <Col lg={4}>
              <div className="cart-panel cart-summary">
                <div className="cart-panel-body">
                  <div className="cart-summary-row">
                    <div>Subtotal estimado</div>
                    <strong>{formatCOPFromCents(totals.subtotalCents)}</strong>
                  </div>

                  <div className="cart-summary-note">
                    El total final se calcula en el checkout según precios oficiales.
                  </div>

                  <Button
                    variant="outline-warning"
                    className="w-100"
                    onClick={onCheckout}
                    disabled={!validation.ok || state.items.length === 0 || isCheckingOut}
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

                  <Link to="/" className="btn btn-outline-light w-100 mt-2">
                    Seguir comprando
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
}
