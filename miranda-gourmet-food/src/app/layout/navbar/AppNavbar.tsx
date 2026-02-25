import { useMemo } from "react";
import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { BsCart } from "react-icons/bs";

import { useCart } from "../../../features/cart/hooks/useCart";

function BrandLogo() {
  return (
    <img
      src="/assets/logo.png"
      alt="Miranda Gourmet Food"
      width={70}
      height={40}
      className="nav-logo"
    />
  );
}

function cartCount(items: { quantity: number }[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export default function AppNavbar() {
  const { state } = useCart();
  const count = useMemo(() => cartCount(state.items), [state.items]);
  const { pathname } = useLocation();

  const isCorporate = pathname.startsWith("/corporativos");
  const isQuote = pathname.startsWith("/quote");
  const isGallery = pathname.startsWith("/galeria");

  return (
    <Navbar expand="md" fixed="top" className="nav-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="nav-brand">
          <BrandLogo />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" className="nav-toggle" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto nav-links">
            <Nav.Link
              as={Link}
              to="/corporativos"
              active={isCorporate}
              className={`nav-linkItem ${isCorporate ? "active" : ""}`}
            >
              Corporativos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/galeria"
              active={isGallery}
              className={`nav-linkItem ${isGallery ? "active" : ""}`}
            >
              Galería
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/quote"
              active={isQuote}
              className={`nav-linkItem ${isQuote ? "active" : ""}`}
            >
              Cotizar
            </Nav.Link>

          </Nav>

          <div className="nav-actions">
            <Link to="/cart" className="nav-cartBtn" aria-label="Ir al carrito">
              <BsCart className="nav-cartIcon" />

              {count > 0 && (
                <Badge pill className="nav-cartBadge">
                  {count}
                </Badge>
              )}
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

