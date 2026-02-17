import { Badge, Card, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsCheck2Circle, BsClock, BsPeople, BsStars } from "react-icons/bs";
import "./corporativos.css";

type Highlight = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const highlights: Highlight[] = [
  {
    icon: <BsStars />,
    title: "Presentación premium",
    desc: "Montaje sobrio y elegante para equipos ejecutivos y clientes.",
  },
  {
    icon: <BsClock />,
    title: "Logística puntual",
    desc: "Coordinación por horarios, accesos, parqueaderos y protocolos.",
  },
  {
    icon: <BsPeople />,
    title: "Escalable",
    desc: "Desde reuniones pequeñas hasta eventos corporativos masivos.",
  },
];

type PackageCard = {
  title: string;
  subtitle: string;
  bullets: string[];
  badge?: string;
};

const packages: PackageCard[] = [
  {
    title: "Coffee Break Ejecutivo",
    subtitle: "Ideal para reuniones, talleres y juntas",
    bullets: [
      "Bebidas calientes/frías",
      "Opciones dulces y saladas",
      "Montaje corporativo",
    ],
    badge: "Más pedido",
  },
  {
    title: "Lunch ",
    subtitle: "Almuerzo completo para equipos",
    bullets: [
      "Menú balanceado",
      "Opciones vegetarianas",
      "Entrega y montaje",
    ],
  },
  {
    title: "Evento de Gala",
    subtitle: "Recepciones, lanzamientos y celebraciones",
    bullets: [
      "Canapés + bebidas",
      "Personal de apoyo",
      "Experiencia premium",
    ],
    badge: "Premium",
  },
];

type Testimonial = {
  company: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    company: "Cliente corporativo (demo)",
    quote:
      "Excelente logística y presentación. Puntuales, claros y muy profesionales.",
  },
  {
    company: "Equipo de Talento Humano (demo)",
    quote:
      "La experiencia fue impecable. Muy buena atención al detalle y opciones para todos.",
  },
];

export default function CorporativosPage() {
  return (
    <>
      {/* HERO */}
      <section
        className="corp-page"
        style={{ backgroundImage: 'url("/assets/bg/corporativos.png")' }}
      >
        <div className="corp-overlay" />

        <Container className="corp-content">
          <header className="corp-glass">
            <Row className="g-4 align-items-center">
              <Col lg={7}>
                <div className="text-uppercase small fw-semibold mb-2 corp-eyebrow">
                  Servicios corporativos · catering profesional
                </div>

                <h1 className="display-5 fw-semibold mb-2">
                  Catering corporativo{" "}
                  <span className="corp-underline">premium</span> para eventos
                  impecables.
                </h1>

                <p className="fs-5 mb-3 corp-lead">
                  Diseñado para empresas: puntualidad, montaje sobrio, y una
                  experiencia gastronómica que se siente de alto nivel — sin
                  complicarte.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <Link to="/quote" className="btn btn-outline-warning btn-lg">
                    Cotizar evento
                  </Link>
                  <Link to="/cart" className="btn btn-outline-light btn-lg">
                    Ver carrito
                  </Link>
                </div>

                <div className="mt-4">
                  <Row className="g-2">
                    {highlights.map((h) => (
                      <Col md={4} key={h.title}>
                        <Card className="h-100 border-0 shadow-sm corp-glassCard">
                          <Card.Body className="p-3">
                            <div className="corp-highlightTitle">
                              <span className="corp-icon">{h.icon}</span>
                              {h.title}
                            </div>
                            <div className="text-muted small">
                              {h.desc}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>

              <Col lg={5}>
                <div className="corp-sideCard">
                  <div className="text-uppercase small fw-semibold text-muted mb-2">
                    Qué incluye el servicio
                  </div>

                  <ul className="corp-checkList">
                    <li>
                      <BsCheck2Circle /> Coordinación previa (horarios,
                      montaje, accesos)
                    </li>
                    <li>
                      <BsCheck2Circle /> Menú adaptable (dietas,
                      vegetarianos, etc.)
                    </li>
                    <li>
                      <BsCheck2Circle /> Montaje corporativo y presentación
                    </li>
                    <li>
                      <BsCheck2Circle /> Confirmación y seguimiento
                    </li>
                  </ul>

                  <div className="mt-3 d-grid gap-2">
                    <Link
                      to="/quote"
                      className="btn btn-dark btn-lg"
                    >
                      Empezar cotización
                    </Link>
                    <Link
                      to="/"
                      className="btn btn-outline-light btn-lg"
                    >
                      Volver al inicio
                    </Link>
                  </div>

                  <div className="text-muted small mt-3">
                    * Si ya sabes qué necesitas, cotiza. Si no, te asesoramos.
                  </div>
                </div>
              </Col>
            </Row>
          </header>
        </Container>
      </section>

      {/* PACKAGES */}
      <section className="corp-section">
        <Container>
          <div className="d-flex align-items-end justify-content-between gap-3 mb-3">
            <div>
              <h2 className="h4 mb-1">Paquetes corporativos</h2>
              <div className="text-muted">
                Opciones base para arrancar rápido. Puedes personalizar todo.
              </div>
            </div>

            <Link to="/quote" className="btn btn-outline-warning">
              Cotizar
            </Link>
          </div>

          <Row className="g-3">
            {packages.map((p) => (
              <Col lg={4} key={p.title}>
                <Card className="h-100 border-0 shadow-sm corp-packageCard">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div>
                        <div className="h5 mb-1">{p.title}</div>
                        <div className="text-muted small">
                          {p.subtitle}
                        </div>
                      </div>

                      {p.badge && (
                        <Badge className="corp-badge" pill>
                          {p.badge}
                        </Badge>
                      )}
                    </div>

                    <ul className="mt-3 mb-0 corp-bullets">
                      {p.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </Card.Body>

                  <Card.Footer className="border-0 bg-transparent px-4 pb-4 pt-0">
                    <Link
                      to="/quote"
                      className="btn btn-outline-light w-100"
                    >
                      Solicitar este paquete
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="corp-section">
        <Container>
          <Row className="g-3">
            <Col lg={6}>
              <Card className="border-0 shadow-sm corp-glassPanel">
                <Card.Body className="p-4">
                  <h3 className="h5 mb-2">Cómo trabajamos</h3>
                  <div className="text-muted mb-3">
                    Un proceso simple para que el resultado sea impecable.
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <ProcessStep
                      n="1"
                      title="Cotización"
                      desc="Te hacemos preguntas clave y definimos alcance."
                    />
                    <ProcessStep
                      n="2"
                      title="Plan y menú"
                      desc="Ajustamos menú, logística y tiempos."
                    />
                    <ProcessStep
                      n="3"
                      title="Ejecución"
                      desc="Montaje, servicio y seguimiento en sitio."
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm corp-glassPanel">
                <Card.Body className="p-4">
                  <h3 className="h5 mb-2">
                    Lo que te garantizamos
                  </h3>
                  <div className="text-muted mb-3">
                    Confianza y ejecución limpia.
                  </div>

                  <ul className="corp-checkList">
                    <li><BsCheck2Circle /> Puntualidad y comunicación</li>
                    <li><BsCheck2Circle /> Presentación corporativa</li>
                    <li><BsCheck2Circle /> Adaptación a dietas</li>
                    <li><BsCheck2Circle /> Control de cantidades</li>
                  </ul>

                  <div className="mt-3">
                    <Link
                      to="/quote"
                      className="btn btn-outline-warning w-100"
                    >
                      Cotizar ahora
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* TESTIMONIALS */}
      <section className="corp-sectionTight">
        <Container>
          <h2 className="h4 mb-3">Clientes</h2>

          <Row className="g-3">
            {testimonials.map((t) => (
              <Col lg={6} key={t.company}>
                <Card className="border-0 shadow-sm corp-glassPanel">
                  <Card.Body className="p-4">
                    <div className="text-muted small mb-2">
                      {t.company}
                    </div>
                    <div className="corp-quote">
                      &ldquo;{t.quote}&rdquo;
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
}

function ProcessStep({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="d-flex gap-3">
      <div className="corp-stepBubble">{n}</div>
      <div>
        <div className="fw-semibold">{title}</div>
        <div className="text-muted small">{desc}</div>
      </div>
    </div>
  );
}
