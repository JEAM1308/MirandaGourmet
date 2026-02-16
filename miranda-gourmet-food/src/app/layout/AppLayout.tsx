import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AppNavbar from "./Navbar";
import AppFooter from "./Footer";

export default function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        <Container className="py-4">
          <Outlet />
        </Container>
      </main>
      <AppFooter />
    </div>
  );
}
