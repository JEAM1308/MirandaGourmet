import { useEffect } from "react";
import { Container, Card } from "react-bootstrap";
import { useCart } from "../../cart/hooks/useCart";
import { Link } from "react-router-dom";

export default function CheckoutSuccessPage() {
  const { dispatch } = useCart();

  useEffect(() => {
    // Limpia carrito al volver del pago
    dispatch({ type: "CLEAR" });
  }, [dispatch]);

  return (
    <Container className="py-5">
      <Card className="p-4 text-center">
        <h1 className="h4 mb-2">Pago confirmado ✅</h1>
        <div className="text-muted mb-3">
          Gracias. Te contactaremos para confirmar detalles del servicio.
        </div>
        <Link to="/" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </Card>
    </Container>
  );
}
