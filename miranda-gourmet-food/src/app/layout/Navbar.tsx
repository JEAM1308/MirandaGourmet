import { useMemo } from "react";
import { Button, Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../features/cart/hooks/useCart";
import { BsCart } from "react-icons/bs";
function BrandLogo(){
    return (
        <img src="/assets/logo.png" alt="logo"
        width={70}
        height={40} />
    );

}

function cartCount(items: { quantity: number }[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export default function AppNavbar() {
  const { state } = useCart();

  const count = useMemo(() => cartCount(state.items), [state.items]);

  return (
    <Navbar bg="dark" variant="dark" expand="md" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-semibold">
          <BrandLogo/> 
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/corporativos" >
              Corporativos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/familiares" >
              Eventos familiares
            </Nav.Link>
            <Nav.Link as={NavLink} to="/quote" >
              Cotizar
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link as={NavLink} to="/cart" className="d-flex align-items-center gap-2">
                <Button variant="outline-light">
                    <BsCart/>
                    {count > 0 && (
                        <Badge bg="dark" pill>
                        {count}
                        </Badge>
                    )}
                </Button>
              
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
