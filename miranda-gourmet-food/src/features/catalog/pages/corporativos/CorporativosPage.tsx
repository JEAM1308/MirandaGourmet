import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Card, Col, Container, Modal, Row } from "react-bootstrap";
import { BsArrowRight, BsCheck2Circle, BsClock, BsPeople, BsStars } from "react-icons/bs";
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
type ServiceId = "lunch-box" | "eventos-masivos" | "eventos-gala" | "entrega-empresarial";

type Service = {
  id: ServiceId;
  title: string;
  subtitle: string;
  bullets: string[];
  image: { src: string; alt: string };
  badge?: string;
  // Contenido del modal
  intro: string;
  includes: string[];
  idealFor: string[];
  options: string[];
  notes?: string[];

};

const services: Service[] = [
  {
    id: "lunch-box",
    title: "Lunch Box",
    subtitle: "Almuerzos individuales para equipos",
    bullets: [
      "Porciones balanceadas y presentación exclusiva",
      "Opciones vegetarianas y restricciones alimentarias",
      "Entrega programada",
    ],
    badge: "Más pedido",
    image: {
      src: "/assets/services/corporativos/lunch-box.png",
      alt: "Lunch Box corporativo",
    },
    intro: "Una solución limpia y premium para equipos: porciones individuales, presentación impecable y logística fácil.",
    includes: [
      "Menú individual (proteína + acompañamientos)",
      "Cubiertos/servilletas (opcional)",
      "Etiquetado por tipo de dieta (si aplica)",
      "Entrega por franjas horarias",
    ],
    idealFor: ["Reuniones internas", "Capacitaciones", "Días de oficina con alta carga"],
    options: ["Vegetariano / vegano", "Sin gluten (según disponibilidad)", "Bebidas", "Postre"],
    notes: ["Los tiempos de entrega dependen de zona y cantidad."],
  },
  {
    id: "eventos-masivos",
    title: "Eventos Masivos",
    subtitle: "Grandes volúmenes con control y logística",
    bullets: [
      "Planeación por cantidades, estaciones y tiempos",
      "Montaje eficiente para alto flujo",
      "Equipo de apoyo y coordinación en sitio",
    ],
    image: {
      src: "/assets/services/corporativos/eventos.png",
      alt: "Catering para eventos masivos",
    },
    intro:
      "Diseñado para alto flujo: planificación por estaciones, control operativo y coordinación en sitio para que todo fluya.",
    includes: [
      "Planeación por cantidades y horarios",
      "Montaje por estaciones/zonas",
      "Coordinación logística y operación",
      "Opciones de personal en sitio (según plan)",
    ],
    idealFor: ["Convenciones", "Eventos internos grandes", "Activaciones y ferias"],
    options: ["Estaciones temáticas", "Servicio en sitio", "Bebidas", "Señalización básica"],
  },
  {
    id: "eventos-gala",
    title: "Eventos de Gala",
    subtitle: "Recepciones ejecutivas y experiencias premium",
    bullets: [
      "Canapés, bebidas y presentación sobria",
      "Personal de apoyo (opcional)",
      "Montaje elegante para clientes y directivos",
    ],
    image: {
      src: "/assets/services/corporativos/gala.png",
      alt: "Catering para eventos de gala",
    },
    intro:
      "Una experiencia de alto nivel para clientes y directivos: servicio sobrio, presentación premium y ejecución impecable.",
    includes: [
      "Selección de canapés y pasabocas",
      "Montaje elegante (según espacio)",
      "Cristalería básica (opcional)",
      "Personal de apoyo (opcional)",
    ],
    idealFor: ["Lanzamientos", "Cócteles corporativos", "Recepciones ejecutivas"],
    options: ["Maridaje de bebidas", "Mesa de postres", "Branding discreto en montaje"],
    notes: ["Se recomienda agendar con antelación para asegurar disponibilidad."],
  },
  {
    id: "entrega-empresarial",
    title: "Entrega Empresarial",
    subtitle: "Catering recurrente para oficina",
    bullets: [
      "Planes semanales o mensuales",
      "Entrega a áreas / pisos / salas",
      "Factura y coordinación administrativa",
    ],
    image: {
      src: "/assets/services/corporativos/entrega.png",
      alt: "Entrega empresarial de catering",
    },
    intro:
      "Ideal si necesitas catering frecuente: planes semanales/mensuales, coordinación administrativa y entrega organizada.",
    includes: [
      "Plan semanal o mensual",
      "Entrega por áreas/salas/pisos",
      "Coordinación con administración",
      "Opciones de menú rotativo",
    ],
    idealFor: ["Oficinas", "Equipos híbridos", "Reuniones recurrentes"],
    options: ["Menú rotativo", "Control por listas", "Factura/soporte administrativo"],
  },
];

type Testimonial = {
  company: string;
  quote: string;
};
const testimonials: Testimonial[] = [
  {
    company: "ACAIRE",
    quote:
      "Confiables y profesionales.",
  },
  {
    company: "CEACON",
    quote:
      "Simplemente delicioso. Siempre cumplen.",
  },
  {
    company: "Yemail Arquitectura",
    quote:
      "Nos salvaron la vida en un evento urgente.",
  },
  {
    company: "IFX Networks Colombia",
    quote:
      "Excelente empresa. Confiable, puntual, y con muy buen servicio.",
  },
];

function ServiceModal({
  show,
  onHide,
  service,
}: {
  show: boolean;
  onHide: () => void;
  service: Service | null;
}) {
  if (!service) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="corp-modal">
      <Modal.Header closeButton closeVariant="white" className="corp-modalHeader">
        <Modal.Title className="corp-modalTitle">
          {service.title} <span className="corp-modalSub">— {service.subtitle}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="corp-modalBody">
        <div className="corp-modalTop">
          <img className="corp-modalImg" src={service.image.src} alt={service.image.alt} />
          <div className="corp-modalImgOverlay" />
          {service.badge && (
            <Badge pill className="corp-badge corp-modalBadge">
              {service.badge}
            </Badge>
          )}
        </div>

        <p className="corp-modalIntro">{service.intro}</p>

        <Row className="g-3">
          <Col md={6}>
            <div className="corp-modalSectionTitle">Incluye</div>
            <ul className="corp-checkList">
              {service.includes.map((x) => (
                <li key={x}>
                  <BsCheck2Circle /> {x}
                </li>
              ))}
            </ul>
          </Col>

          <Col md={6}>
            <div className="corp-modalSectionTitle">Ideal para</div>
            <ul className="corp-modalList">
              {service.idealFor.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>

            <div className="corp-modalSectionTitle mt-3">Opciones</div>
            <ul className="corp-modalList">
              {service.options.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </Col>
        </Row>

        {service.notes?.length ? (
          <div className="corp-modalNotes">
            {service.notes.map((n) => (
              <div key={n} className="corp-modalNote">
                * {n}
              </div>
            ))}
          </div>
        ) : null}
      </Modal.Body>

      <Modal.Footer className="corp-modalFooter">
        <Button variant="outline-light" onClick={onHide}>
          Cerrar
        </Button>

        <Link to="/quote" className="btn btn-outline-warning">
          Quiero este servicio <BsArrowRight className="ms-1" />
        </Link>
      </Modal.Footer>
    </Modal>
  );
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({ top: y, behavior: "smooth" });
}

export default function CorporativosPage() {
  const [openId, setOpenId] = useState<ServiceId | null>(null);
  const selected = useMemo(() => services.find((s) => s.id === openId) ?? null, [openId]);
  const isOpen = openId !== null;
  return (
    <>
      {/* HERO */}
      <section
        className="corp-page"
        style={{ backgroundImage: 'url("/assets/bg/corp/hero.png")' }}
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
                  experiencia gastronómica de alto nivel.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button className="btn btn-outline-warning btn-lg" onClick={() => scrollToSection("paquetes-corporativos")}>
                    Mira nuestra oferta
                  </button>
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
      <section 
      id="paquetes-corporativos"
      className="corp-section"
      style={{ backgroundImage: 'url("/assets/bg/corp/packages.png")' }}
      >

        <Container className="corp-glass">
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
            {services.map((s) => (
              <Col sm={6} md={4} lg={3} key={s.id}>
                <Card className="h-100 border-0 shadow corp-packageCard">
                  <div className="corp-packageMedia">
                    <Card.Img
                      variant="top"
                      src={s.image.src}
                      alt={s.image.alt}
                      className="corp-packageImg"
                    />
                    <div className="corp-packageMediaOverlay" />
                    {s.badge && (
                      <div className="d-flex m-2 align-items-center justify-content-end">
                      <Badge className="corp-badge corp-packageBadge" pill>
                        {s.badge}
                      </Badge>
                      </div>
                    )}
                  </div>

                  <Card.Body className="p-4">
                    <div className="h5 mb-1">{s.title}</div>
                    <div className="text-muted small">{s.subtitle}</div>

                    <ul className="mt-3 mb-0 corp-bullets">
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </Card.Body>

                  <Card.Footer className="border-0 bg-transparent px-4 pb-4 pt-0">
                    <Button variant="outline-light" onClick={() => setOpenId(s.id)}>
                      Ver detalle
                    </Button>
                  </Card.Footer>
                </Card>

              </Col>
            ))}
          </Row>
        </Container>
      </section>
      <ServiceModal show={isOpen} onHide={() => setOpenId(null)} service={selected}/>
      {/* HOW IT WORKS */}
      <section 
      className="corp-section"
      style={{ backgroundImage: 'url("/assets/bg/corp/how-it-works.png")' }}
      >
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
                      className="btn btn-outline-light w-100"
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
      <section 
      className="corp-sectionTight">
        <Container>
          <h2 className="h4 mb-3 corp-glass text-center">Nuestros clientes</h2>

          <Row className="g-3">
            {testimonials.map((t) => (
              <Col lg={6} key={t.company}>
                <Card className="border-0 shadow-sm corp-glassPanel">
                  <Card.Header>
                    <div className="text-center ">
                      {t.company}
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4 text-center">
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
