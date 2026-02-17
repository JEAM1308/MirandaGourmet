import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

import styles from "./Home.module.css";

export default function HomePage() {
  return (
    <section
      id="home"
      className="pageSection d-flex align-items-center"
      style={{ backgroundImage: `url("/assets/bg/home.png")` }}
    >
      <div className={styles.sectionOverlay} />

      <Container className={`${styles.sectionContent} d-flex`}>
        <header className={`${styles.homeHeader} ${styles.glassWrap}`}>
          <Row className="g-4">
            <Col lg={7}>
              <div className={`text-uppercase small fw-semibold mb-2 ${styles.eyebrow}`}>
                Catering corporativo · experiencias familiares
              </div>

              <h1 className="display-5 fw-semibold mb-2">
                Experiencias gastronómicas{" "}
                <span className={styles.underlineAccent}>memorables</span>, sin complicaciones.
              </h1>

              <p className={`fs-5 ${styles.lead}`}>
                Servicio profesional para empresas y familias: logística impecable, presentación premium y
                personalización total.
              </p>

              <ul className={`mb-4 ${styles.bullets}`}>
                <li><strong>12 años de experiencia</strong></li>
                <li><strong>Experiencias de gala</strong></li>
                <li>Eventos corporativos y familiares</li>
              </ul>

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
              <div className={styles.sideCard}>
                <div className="text-uppercase small fw-semibold text-muted mb-2">Cómo funciona</div>

                <div className="d-flex flex-column gap-3">
                  <Step number="1" title="Elige tu servicio" desc="Corporativos o familiares, con opciones claras." />
                  <Step number="2" title="Configura detalles" desc="Personas, fecha, ubicación, notas y adicionales." />
                  <Step number="3" title="Paga y confirma" desc="Checkout seguro. Te contactamos para coordinar." />
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
      <div className={styles.stepBubble}>{number}</div>
      <div>
        <div className="fw-semibold">{title}</div>
        <div className="text-muted small">{desc}</div>
      </div>
    </div>
  );
}
