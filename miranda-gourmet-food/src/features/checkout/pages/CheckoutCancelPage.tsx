import { Container, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function CheckoutCancelPage() {
  return (
    <Container className="py-5">
      <Card className="p-4 text-center">
        <h1 className="h4 mb-2">Pago cancelado</h1>
        <div className="text-muted mb-3">
          No pasó nada. Tu carrito sigue intacto.
        </div>
        <Link to="/cart" className="btn btn-outline-secondary me-2">
          Volver al carrito
        </Link>
        <Link to="/" className="btn btn-primary">
          Ver catálogo
        </Link>
      </Card>
    </Container>
  );
}
