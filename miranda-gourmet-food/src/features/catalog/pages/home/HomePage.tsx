import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsPatchCheck, BsBookmarkStar } from "react-icons/bs";
import { type ReactNode } from "react";

const iconsMap = {
  sabor: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-fork-knife"
      viewBox="0 0 16 16"
    >
      <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z" />
    </svg>
  ),
  fiabilidad: <BsPatchCheck />,
  experiencia: <BsBookmarkStar />,
};

function TrustPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="row d-flex align-items-center justify-content-around mb-1">
      <div className="col-12 text-center">
        {icon} {text}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <section id="home" className="home-page d-flex align-items-center">
      <div className="home-overlay" />

      <Container className="home-content">
        <header className="home-header home-glass">
          <Row className="g-4">
            <Col lg={7}>
              <div className="text-uppercase small fw-semibold mb-2 home-eyebrow">
                Catering corporativo · experiencias familiares
              </div>

              <h1 className="display-5 fw-semibold mb-2">
                Experiencias gastronómicas{" "}
                <span className="home-underline">memorables</span>
              </h1>

              <p className="fs-5 home-lead">
                Servicio profesional para empresas y familias: logística impecable,
                presentación premium y personalización total.
              </p>

              <div className="row col-12 d-flex justify-content-center m-2 align-items-center">
                <div className="col-6 m-1 home-bullets">
                  <TrustPoint icon={iconsMap.sabor} text="Sabor único" />
                  <TrustPoint icon={iconsMap.fiabilidad} text="Fiabilidad demostrada" />
                  <TrustPoint icon={iconsMap.experiencia} text="Experiencia probada" />
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <Link to="/corporativos" className="btn btn-outline-warning btn-lg">
                  Servicios corporativos
                </Link>
                <Link to="/familiares" className="btn btn-outline-warning btn-lg">
                  Eventos familiares
                </Link>
                <Link to="/quote" className="btn btn-outline-warning btn-lg">
                  Cotizar evento
                </Link>
              </div>
            </Col>

            <Col lg={5}>
              <div className="home-sideCard">
                <div className="text-uppercase small fw-semibold text-muted mb-2">
                  Cómo funciona
                </div>

                <div className="d-flex flex-column gap-3">
                  <Step
                    number="1"
                    title="Elige tu servicio"
                    desc="Corporativos o familiares, con opciones claras."
                  />
                  <Step
                    number="2"
                    title="Configura detalles"
                    desc="Personas, fecha, ubicación, notas y adicionales."
                  />
                  <Step
                    number="3"
                    title="Paga y confirma"
                    desc="Checkout seguro. Te contactamos para coordinar."
                  />
                </div>

                <div className="mt-4 d-grid gap-2">
                  <Link to="/corporativos" className="btn btn-dark btn-lg">
                    Explorar servicios
                  </Link>
                  <Link to="/cart" className="btn btn-outline-light btn-lg">
                    Ir al carrito
                  </Link>
                </div>

                <div className="text-muted small mt-3">
                  * Para servicios complejos, usa <strong>Cotizar</strong>.
                </div>
              </div>
            </Col>
          </Row>
        </header>
      </Container>
    </section>
  );
}

function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="d-flex gap-3">
      <div className="home-stepBubble">{number}</div>
      <div>
        <div className="fw-semibold">{title}</div>
        <div className="text-muted small">{desc}</div>
      </div>
    </div>
  );
}
