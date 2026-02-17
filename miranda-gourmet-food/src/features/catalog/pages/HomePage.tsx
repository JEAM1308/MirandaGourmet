import { Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsShieldCheck, BsPersonFillGear, BsStar } from "react-icons/bs";

export default function HomePage() {
  return (
    <div className="py-2">
      {/* HERO */}
      <Card className="border-0 shadow-sm overflow-hidden glass-card">
          <div className="glass-dark">
          <Container className="py-5" >
            <Row className="align-items-center g-4">
              <Col lg={7}>
                <div className="text-uppercase small fw-semibold mb-2"
                style={{color: "gray"}}
                >
                  Catering corporativo · experiencias familiares
                </div>

                <h1 className="display-6 fw-semibold lh-sm mb-3 text-white">
                  Experiencias gastronómicas{" "}
                  <span style={{ textDecoration: "underline", textUnderlineOffset: 6 }}>
                    memorables
                  </span>
                  , sin complicaciones.
                </h1>
                <ul className="fs-6 mb-4" style={{ maxWidth: 640, color: "gray" }}>
                  <li><strong>12 años de experiencia</strong></li>
                  <li><strong>Experiencias de Gala</strong> </li>
                  <li>eventos familiares</li>
                </ul>
                
                <div className="d-flex flex-column flex-sm-row gap-2">
                    <Link to="/corporativos" className="btn btn-outline-warning btn-lg">
                        Servicios corporativos
                    </Link>
                    <Link to="/familiares" className="btn btn-outline-warning btn-lg">
                        Eventos familiares
                    </Link>
                    <Link to="/quote" className="btn btn-outline-warning btn-lg">
                        Evento personalizado
                    </Link>
                </div>

                {/* Trust points */}
                <Row className="mt-4 d-flex align-items-center" style={{ maxWidth: 720 }}>
                  <p className="text-white d-flex justify-content-center">
                    ¿Por qué elegirnos?
                  </p>
                </Row>
                <Row className="g-2" style={{ maxWidth: 720 }}>
                  <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm"
                    style={{background: "gray"}}>
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1 d-flex align-items-center gap-1 text-black"> 
                          <BsShieldCheck /> Pago seguro
                        </div>
                        <div className="small">
                          Stripe Checkout con validación.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm"
                    style={{background: "gray"}}>
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1 d-flex align-items-center gap-1 text-black"> 
                          <BsPersonFillGear/> Personalizable
                        </div>
                        <div className="small">
                          Personas, fecha, dirección y add-ons por servicio.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm"
                    style={{background: "gray"}}>
                      <Card.Body className="p-3">
                        <div className="fw-semibold mb-1 d-flex align-items-center gap-1 text-black"> 
                          <BsStar/> Excelente servicio
                        </div>
                        <div className="small">
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

      {/* BLOQUE CATEGORÍAS */}
      <Container className="py-4">
        <Row className="g-3">
          <Col md={6}>
            <CategoryCard
              title="Nuestros clientes"
              desc="Conoce con quienes hemos trabajado."
              to="/corporativos"
              variant="outline-light"
            />
          </Col>
          <Col md={6}>
            <CategoryCard
              title="Nosotros"
              desc="Conoce quiénes somos y nuestra historia."
              to="/familiares"
              variant="outline-light"
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
  variant: string;
}) {
  return (
    <Card className="h-100 border-0 shadow-sm glass-card">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div className="h5 mb-1 text-white">{title}</div>
            <div style={{color: "white"}}>{desc}</div>
          </div>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: "rgba(0,0,0,0.5)",
            }}
          />

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
