import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Card, Container, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

type OrderStatus = "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
type PaymentProvider = "stripe" | "wompi";

type OrderItemSnapshot = {
  offeringId: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  selection: {
    variantId?: string;
    people?: number;
    dateISO?: string;
    address?: string;
    notes?: string;
  };
};

type Order = {
  id: string;
  provider: PaymentProvider;
  transactionId: string;
  status: OrderStatus;
  currency: "COP";
  totalAmountCents: number;
  items: OrderItemSnapshot[];
  createdAtISO: string;
};

function formatCOPFromCents(amountCents: number) {
  const amount = amountCents / 100;
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function statusVariant(s: OrderStatus): "success" | "danger" | "warning" | "secondary" {
  if (s === "APPROVED") return "success";
  if (s === "DECLINED" || s === "ERROR") return "danger";
  if (s === "PENDING") return "warning";
  return "secondary";
}

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = useMemo(() => (id && id.trim().length > 0 ? id : null), [id]);

  useEffect(() => {
    if (!orderId) {
      setError("Falta el ID de la orden.");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/orders/${orderId}`);
        const data = (await res.json()) as unknown;

        if (cancelled) return;

        if (!res.ok) {
          const msg =
            data && typeof data === "object" && "error" in data
              ? String((data as { error: unknown }).error)
              : "No se pudo cargar la orden.";
          setError(msg);
          setOrder(null);
          return;
        }

        setOrder(data as Order);
      } catch (e) {
        if (!cancelled) {setError("Error inesperado cargando la orden."); console.log(e)}
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h1 className="h4 mb-1">Detalle de la orden</h1>
          <div className="text-muted small">Miranda Gourmet Food</div>
        </div>
        <Link to="/" className="btn btn-outline-secondary">
          Volver al inicio
        </Link>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          {loading && (
            <div className="d-flex align-items-center gap-2">
              <Spinner size="sm" />
              <div className="text-muted">Cargando orden…</div>
            </div>
          )}

          {!loading && error && (
            <Alert variant="danger" className="mb-0">
              <div className="fw-semibold">No se pudo mostrar la orden</div>
              <div className="small">{error}</div>
              <div className="mt-3">
                <Link to="/cart" className="btn btn-outline-secondary btn-sm">
                  Volver al carrito
                </Link>
              </div>
            </Alert>
          )}

          {!loading && !error && order && (
            <>
              <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                <Badge bg={statusVariant(order.status)}>{order.status}</Badge>
                <span className="text-muted small">
                  Orden: <span className="fw-semibold">{order.id}</span>
                </span>
                <span className="text-muted small">
                  Provider: <span className="fw-semibold">{order.provider}</span>
                </span>
              </div>

              <div className="text-muted small mb-3">
                Creada:{" "}
                <span className="fw-semibold">
                  {new Date(order.createdAtISO).toLocaleString("es-CO")}
                </span>
                {" · "}
                Transacción: <span className="fw-semibold">{order.transactionId}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 rounded border mb-3">
                <div className="text-muted">Total</div>
                <div className="fw-semibold">{formatCOPFromCents(order.totalAmountCents)}</div>
              </div>

              <div className="fw-semibold mb-2">Items</div>

              <div className="d-flex flex-column gap-2">
                {order.items.map((it) => (
                  <div key={it.offeringId} className="p-3 rounded border">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold">{it.title}</div>
                        <div className="text-muted small">
                          Cantidad: <span className="fw-semibold">{it.quantity}</span>
                        </div>

                        <div className="text-muted small mt-2">
                          {it.selection.variantId && (
                            <div>Variante: <span className="fw-semibold">{it.selection.variantId}</span></div>
                          )}
                          {typeof it.selection.people === "number" && (
                            <div>Personas: <span className="fw-semibold">{it.selection.people}</span></div>
                          )}
                          {it.selection.dateISO && (
                            <div>Fecha: <span className="fw-semibold">{it.selection.dateISO}</span></div>
                          )}
                          {it.selection.address && (
                            <div>Dirección: <span className="fw-semibold">{it.selection.address}</span></div>
                          )}
                          {it.selection.notes && (
                            <div>Notas: <span className="fw-semibold">{it.selection.notes}</span></div>
                          )}
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="text-muted small">Unitario</div>
                        <div className="fw-semibold">{formatCOPFromCents(it.unitPriceCents)}</div>

                        <div className="text-muted small mt-2">Subtotal</div>
                        <div className="fw-semibold">
                          {formatCOPFromCents(it.unitPriceCents * it.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
