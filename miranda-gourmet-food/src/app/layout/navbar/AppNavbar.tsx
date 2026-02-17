import { useMemo, useState } from "react";
import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
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
  const [activeLink, setActiveLink] = useState(0);
  const { state } = useCart();
  const count = useMemo(() => cartCount(state.items), [state.items]);

  return (
    <Navbar expand="md" fixed="top" className="nav-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="nav-brand" onClick={ () => setActiveLink(0)}>
          <BrandLogo />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" className="nav-toggle" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto nav-links">
            <Nav.Link
              as={NavLink}
              to="/corporativos"
              onClick={ () => setActiveLink(1)}
              className={`nav-linkItem ${activeLink === 1 ? "active" : ""}`}
            >
              Corporativos
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/familiares"
              onClick={ () => setActiveLink(2)}
              className={`nav-linkItem ${activeLink === 2 ? "active" : ""}`}
            >
              Eventos familiares
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/quote"
              onClick={ () => setActiveLink(3)}
              className={`nav-linkItem ${activeLink === 3 ? "active" : ""}`}
              
            >
              Cotizar
            </Nav.Link>
          </Nav>

          <div className="nav-actions">
            <Link to="/cart" className="nav-cartBtn" aria-label="Ir al carrito" onClick={ () => setActiveLink(0)}>
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

