import { useMemo } from "react";
import { Alert, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";

type ServiceId = "lunch-box" | "eventos-masivos" | "eventos-gala" | "entrega-empresarial";

const SERVICE_LABEL: Record<ServiceId, string> = {
  "lunch-box": "Lunch Box",
  "eventos-masivos": "Eventos Masivos",
  "eventos-gala": "Eventos de Gala",
  "entrega-empresarial": "Entrega Empresarial",
};

function isServiceId(x: string): x is ServiceId {
  return (
    x === "lunch-box" ||
    x === "eventos-masivos" ||
    x === "eventos-gala" ||
    x === "entrega-empresarial"
  );
}

export default function QuotePage() {
  const [params] = useSearchParams();

  const service = useMemo(() => {
    const raw = params.get("service");
    if (!raw) return null;
    return isServiceId(raw) ? raw : "INVALID";
  }, [params]);

  return (
    <section className="quote-page">
      <Container className="py-4">
        <Row className="g-3 align-items-start">
          <Col lg={8}>
            <h1 className="h3 mb-1">Cotizar</h1>
            <div className="text-muted">
              Cuéntanos lo esencial y te respondemos con una propuesta clara.
            </div>

            {service === "INVALID" && (
              <Alert variant="warning" className="mt-3">
                El servicio seleccionado no es válido. Puedes elegir uno desde{" "}
                <Link to="/corporativos">Corporativos</Link>.
              </Alert>
            )}

            {service && service !== "INVALID" && (
              <Alert variant="info" className="mt-3">
                Servicio preseleccionado: <strong>{SERVICE_LABEL[service]}</strong>
              </Alert>
            )}

            <Card className="border-0 shadow-sm mt-3">
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control placeholder="Tu nombre" />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Teléfono / WhatsApp</Form.Label>
                      <Form.Control placeholder="+57 ..." />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Correo</Form.Label>
                      <Form.Control type="email" placeholder="tucorreo@email.com" />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tipo de servicio</Form.Label>
                      <Form.Select defaultValue={service && service !== "INVALID" ? service : ""}>
                        <option value="" disabled>
                          Selecciona…
                        </option>
                        <option value="lunch-box">Lunch Box</option>
                        <option value="eventos-masivos">Eventos Masivos</option>
                        <option value="eventos-gala">Eventos de Gala</option>
                        <option value="entrega-empresarial">Entrega Empresarial</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Número de personas</Form.Label>
                      <Form.Control inputMode="numeric" placeholder="Ej: 30" />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Dirección / Lugar</Form.Label>
                      <Form.Control placeholder="Empresa, salón, dirección…" />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Notas</Form.Label>
                      <Form.Control as="textarea" rows={4} placeholder="Dietas, horarios, detalles…" />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                  <button className="btn btn-outline-warning btn-lg" type="button">
                    Enviar solicitud
                  </button>
                  <Link className="btn btn-outline-secondary btn-lg" to="/">
                    Volver al inicio
                  </Link>
                </div>

                <div className="text-muted small mt-3">
                  * Esto es un formulario base. Luego lo conectamos a WhatsApp, email o backend.
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="fw-semibold mb-2">Qué pasa después</div>
                <ol className="text-muted mb-0">
                  <li>Revisamos tu solicitud</li>
                  <li>Te contactamos para afinar detalles</li>
                  <li>Te enviamos propuesta y agenda</li>
                </ol>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
