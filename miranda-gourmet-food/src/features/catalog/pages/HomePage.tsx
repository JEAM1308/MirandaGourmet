import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="py-2">
      {/* HERO */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div
          style={{
            background:
              "radial-gradient(900px 400px at 10% 10%, rgba(0,0,0,0.06), transparent 60%)," +
              "radial-gradient(700px 350px at 90% 20%, rgba(0,0,0,0.05), transparent 55%)," +
              "linear-gradient(180deg, #ffffff, #fafafa)",
          }}
        >
          <Container className="py-5">
            <Row className="align-items-center g-4">
              <Col lg={7}>
                <div className="text-uppercase small text-muted fw-semibold mb-2">
                  Catering corporativo · experiencias familiares
                </div>

                <h1 className="display-6 fw-semibold lh-sm mb-3">
                  Experiencias gastronómicas{" "}
                  <span style={{ textDecoration: "underline", textUnderlineOffset: 6 }}>
                    memorables
                  </span>
                  , sin complicaciones.
                </h1>

                <p className="text-muted fs-5 mb-4" style={{ maxWidth: 640 }}>
                  Desde <strong>Lunch Box</strong> para reuniones ejecutivas hasta{" "}
                  <strong>Experiencias de Gala</strong> y eventos familiares. Selecciona tu servicio,
                  configura detalles y paga con Stripe de forma segura.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2">
                    <Link to="/corporativos" className="btn btn-dark btn-lg">
                        Ver servicios corporativos
                    </Link>
                    <Link to="/familiares" className="btn btn-outline-dark btn-lg">
                        Ver eventos familiares
                    </Link>
                    <Link to="/quote" className="btn btn-outline-secondary btn-lg">
                        Cotizar evento
                    </Link>
                </div>

                {/* Trust points */}
                <Row className="g-2 mt-4" style={{ maxWidth: 720 }}>
                  <Col md={4}>
                    <Card className="h-100 border-0 bg-white shadow-sm">
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1">Pago seguro</div>
                        <div className="text-muted small">
                          Stripe Checkout con validación server-side.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="h-100 border-0 bg-white shadow-sm">
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1">Personalizable</div>
                        <div className="text-muted small">
                          Personas, fecha, dirección y add-ons por servicio.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="h-100 border-0 bg-white shadow-sm">
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1">Para empresas y familia</div>
                        <div className="text-muted small">
                          Diseñado para alta calidad, logística y detalle.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Visual card derecha */}
              <Col lg={5}>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="text-uppercase small text-muted fw-semibold mb-2">
                      Cómo funciona
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <Step
                        number="1"
                        title="Elige tu servicio"
                        desc="Corporativos o eventos familiares, con opciones claras."
                      />
                      <Step
                        number="2"
                        title="Configura detalles"
                        desc="Personas, fecha, ubicación, notas y adicionales."
                      />
                      <Step
                        number="3"
                        title="Paga y confirma"
                        desc="Checkout seguro con Stripe. Te contactamos para coordinar."
                      />
                    </div>

                    <div className="mt-4 d-grid gap-2">
                        <Link to="/corporativos" className="btn btn-dark btn-lg">
                            Explorar servicios
                        </Link>
                        <Link to="/cart" className="btn btn-outline-dark btn-lg">
                            Ver servicios corporativos
                        </Link>
                    </div>

                    <div className="text-muted small mt-3">
                      * Para servicios complejos, usa <strong>Cotizar</strong>.
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </Card>

      {/* BLOQUE CATEGORÍAS */}
      <Container className="py-4">
        <Row className="g-3">
          <Col md={6}>
            <CategoryCard
              title="Corporativos"
              desc="Reuniones ejecutivas, eventos y entregas para equipos."
              to="/corporativos"
              variant="dark"
            />
          </Col>
          <Col md={6}>
            <CategoryCard
              title="Eventos familiares"
              desc="Chef incógnito, experiencias de gala y celebraciones."
              to="/familiares"
              variant="outline-dark"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="d-flex gap-3">
      <div
        className="d-flex align-items-center justify-content-center fw-semibold"
        style={{
          width: 34,
          height: 34,
          borderRadius: 999,
          background: "#111",
          color: "white",
          flex: "0 0 auto",
        }}
      >
        {number}
      </div>
      <div>
        <div className="fw-semibold">{title}</div>
        <div className="text-muted small">{desc}</div>
      </div>
    </div>
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
  variant: "dark" | "outline-dark";
}) {
  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="h5 mb-1">{title}</div>
            <div className="text-muted">{desc}</div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(0,0,0,0.06)",
            }}
          />
        </div>

        <div className="mt-3">
            <Link to={to} className={`btn ${variant === "dark" ? "btn-dark" : "btn-outline-dark"}`}>
                Explorar
            </Link>
        </div>
      </Card.Body>
    </Card>
  );
}
