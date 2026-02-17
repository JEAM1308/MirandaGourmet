import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Container, Spinner } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../cart/hooks/useCart";

type TransactionStatus =
  | "APPROVED"
  | "DECLINED"
  | "PENDING"
  | "VOIDED"
  | "ERROR"
  | "UNKNOWN";

export default function WompiResultPage() {
  const [searchParams] = useSearchParams();
  const { dispatch } = useCart();

  const transactionId = useMemo(() => {
    const id = searchParams.get("id");
    return id && id.trim().length > 0 ? id : null;
  }, [searchParams]);

  const [status, setStatus] = useState<TransactionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) return;

    let cancelled = false;

    async function fetchStatus() {
      try {
        setLoading(true);

        const res = await fetch( `/api/payments/wompi/transactions/${transactionId}` );
        const data = await res.json();
    
        const orderId = typeof data.orderId === "string" ? data.orderId : null;
        
        if (orderId) {
          window.location.href = `/orders/${orderId}`;
          return;
        }
        
        if (cancelled) return;

        const s = data.status as TransactionStatus;
        setStatus(s);

        if (s === "APPROVED") {
          dispatch({ type: "CLEAR" });
        }
      } catch (error) {
        console.error(error);
        setStatus("ERROR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [transactionId, dispatch]);

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4 text-center">
          <h1 className="h4 mb-3">Resultado del pago</h1>

          {!transactionId && (
            <Alert variant="warning">
              No se recibió ID de transacción.
            </Alert>
          )}

          {transactionId && loading && (
            <div className="d-flex justify-content-center align-items-center gap-2">
              <Spinner size="sm" />
              <span>Consultando estado…</span>
            </div>
          )}

          {transactionId && !loading && status === "APPROVED" && (
            <Alert variant="success">
              <div className="fw-semibold">Pago aprobado ✅</div>
              <div className="small mt-2">
                Transacción confirmada. Te contactaremos pronto.
              </div>
            </Alert>
          )}

          {transactionId && !loading && status === "DECLINED" && (
            <Alert variant="danger">
              Pago rechazado ❌
            </Alert>
          )}

          {transactionId && !loading && status === "PENDING" && (
            <Alert variant="info">
              Pago pendiente ⏳
            </Alert>
          )}

          {transactionId && !loading && status === "ERROR" && (
            <Alert variant="danger">
              Error consultando transacción.
            </Alert>
          )}

          <div className="mt-4 d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-dark">
              Volver al inicio
            </Link>
            <Link to="/cart" className="btn btn-outline-secondary">
              Volver al carrito
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
