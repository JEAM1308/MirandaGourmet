import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import styles from "../Home.module.css";

export default function CategoriesSection() {
  return (
    <Container className="py-4">
      <Row className="g-3">
        <Col md={6}>
          <CategoryCard
            title="Nuestros clientes"
            desc="Conoce con quiénes hemos trabajado."
            to="/corporativos"
            variant="outline-light"
          />
        </Col>
        <Col md={6}>
          <CategoryCard
            title="Nosotros"
            desc="Conoce quiénes somos y nuestra historia."
            to="/nosotros"
            variant="outline-light"
          />
        </Col>
      </Row>
    </Container>
  );
}

function CategoryCard({
  title,
  desc,
  to,
  variant,
}: {
  title: string;
  desc: string;
  to: string;
  variant: string;
}) {
  return (
    <Card className={`h-100 border-0 shadow-sm ${styles.categoryCard}`}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="h5 mb-1" style={{ color: "var(--text-strong)" }}>{title}</div>
            <div className={styles.categoryDesc}>{desc}</div>
          </div>
          <div className={styles.categoryIcon} />
        </div>

        <div className="mt-3">
          <Link to={to} className={`btn btn-${variant}`}>
            Explorar
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
