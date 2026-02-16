import { Container } from "react-bootstrap";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-top py-4 mt-auto">
      <Container className="d-flex flex-column flex-md-row justify-content-between gap-2">
        <div className="text-muted small">
          © {year} Miranda Gourmet Food
        </div>
        <div className="text-muted small">
          Hecho con React + TypeScript + Stripe
        </div>
      </Container>
    </footer>
  );
}
