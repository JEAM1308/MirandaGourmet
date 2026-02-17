import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsShieldCheck, BsPersonFillGear, BsStar } from "react-icons/bs";
import styles from "../Home.module.css";

export default function HeroSection() {
  return (
    <Card className={`border-0 shadow-sm ${styles.heroCard}`}>
      <div className={`p-4 p-md-5 ${styles.heroOverlay}`}>
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <div className={`text-uppercase small fw-semibold mb-2 ${styles.eyebrow}`}>
                Catering corporativo · experiencias familiares
              </div>

              <h1 className={`display-6 fw-semibold lh-sm mb-3 ${styles.heroTitle}`}>
                Experiencias gastronómicas{" "}
                <span className={styles.underlineAccent}>memorables</span>, sin complicaciones.
              </h1>

              <ul className={`fs-6 mb-4 ${styles.heroList}`}>
                <li><strong>12 años de experiencia</strong></li>
                <li><strong>Experiencias de Gala</strong></li>
                <li>Eventos corporativos y familiares</li>
              </ul>

              <div className={`d-flex flex-column flex-sm-row gap-2 ${styles.ctaRow}`}>
                <Link to="/corporativos" className="btn btn-outline-warning btn-lg">
                  Servicios corporativos
                </Link>
                <Link to="/familiares" className="btn btn-outline-warning btn-lg">
                  Eventos familiares
                </Link>
                <Link to="/quote" className="btn btn-outline-warning btn-lg">
                  Eventos personalizados
                </Link>
              </div>

              <div className="mt-4">
                <div className={`small fw-semibold mb-2 ${styles.trustHeading}`}>¿Por qué elegirnos?</div>
                <Row className="g-2" style={{ maxWidth: 720 }}>
                  <Col md={4}>
                    <Card className={`h-100 border-0 shadow-sm ${styles.trustCard}`}>
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1 d-flex align-items-center gap-2">
                          <BsShieldCheck /> Pago seguro
                        </div>
                        <div className="small text-muted">Checkout con validación en servidor.</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className={`h-100 border-0 shadow-sm ${styles.trustCard}`}>
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1 d-flex align-items-center gap-2">
                          <BsPersonFillGear /> Personalizable
                        </div>
                        <div className="small text-muted">Personas, fecha, dirección y add-ons por servicio.</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className={`h-100 border-0 shadow-sm ${styles.trustCard}`}>
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1 d-flex align-items-center gap-2">
                          <BsStar /> Excelente servicio
                        </div>
                        <div className="small text-muted">Calidad, logística y detalle para eventos premium.</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>

            <Col lg={5}>
              <Card className={`border-0 shadow-sm ${styles.howCard}`}>
                <Card.Body className="p-4">
                  <div className="text-uppercase small text-muted fw-semibold mb-2">
                    Cómo funciona
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <Step number="1" title="Elige tu servicio" desc="Corporativos o familiares, con opciones claras." />
                    <Step number="2" title="Configura detalles" desc="Personas, fecha, ubicación, notas y adicionales." />
                    <Step number="3" title="Paga y confirma" desc="Checkout seguro. Te contactamos para coordinar." />
                  </div>

                  <div className="mt-4 d-grid gap-2">
                    <Link to="/corporativos" className="btn btn-dark btn-lg">
                      Explorar servicios
                    </Link>
                    <Link to="/cart" className="btn btn-outline-dark btn-lg">
                      Ir al carrito
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
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="d-flex gap-3">
      <div className={`d-flex align-items-center justify-content-center fw-semibold ${styles.stepBubble}`}>
        {number}
      </div>
      <div>
        <div className="fw-semibold">{title}</div>
        <div className="text-muted small">{desc}</div>
      </div>
    </div>
  );
}
