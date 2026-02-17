import { useMemo, useState } from "react";
import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { BsCart } from "react-icons/bs";

import { useCart } from "../../../features/cart/hooks/useCart";
import styles from "./AppNavbar.module.css";

function BrandLogo() {
  return (
    <img
      src="/assets/logo.png"
      alt="Miranda Gourmet Food"
      width={70}
      height={40}
      className={styles.logo}
    />
  );
}

function cartCount(items: { quantity: number }[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export default function AppNavbar() {
  const [ activeLink, setActiveLink ] = useState(0);
  const { state } = useCart();
  const count = useMemo(() => cartCount(state.items), [state.items]);

  return (
    <Navbar expand="md" fixed="top" className={styles.navbar} variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.brand} onClick={() => setActiveLink(0)}>
          <BrandLogo />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" className={styles.toggle} />
        <Navbar.Collapse id="main-navbar">
          <Nav className={`me-auto ${styles.nav}`}>
            <Nav.Link
              as={NavLink}
              to="/corporativos"
              onClick={ () => setActiveLink(1)}
              className={`${styles.navLink} ${activeLink === 1 ? styles.active : ""}`}
            >
              Corporativos
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/familiares"
              onClick={ () => setActiveLink(2)}
              className={`${styles.navLink} ${activeLink === 2 ? styles.active : ""}`}
            >
              Eventos familiares
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/quote"
              onClick={ () => setActiveLink(3)}
              className={`${styles.navLink} ${activeLink === 3 ? styles.active : ""}`}
            >
              Cotizar
            </Nav.Link>
          </Nav>

          <div className={styles.actions}>
            <Link to="/cart" className={styles.cartBtn} aria-label="Ir al carrito" onClick={() => setActiveLink(0)}>
              <BsCart className={styles.cartIcon} />

              {count > 0 && (
                <Badge pill className={styles.cartBadge}>
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
