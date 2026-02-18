import { useMemo, useState } from "react";
import { Alert, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";

import {
  CORPORATE_SERVICES,
  type CorporateServiceId,
  isCorporateServiceId,
} from "../../data/corporateServices"; // ajusta la ruta según tu estructura

type QuoteForm = {
  name: string;
  phone: string;
  email: string;
  people: string;
  date: string;
  address: string;
  notes: string;
};

const INITIAL: QuoteForm = {
  name: "",
  phone: "",
  email: "",
  people: "",
  date: "",
  address: "",
  notes: "",
};

export default function QuotePage() {
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState<QuoteForm>(INITIAL);

  // ✅ Source of truth: URL
  const serviceId = useMemo<CorporateServiceId | "INVALID" | null>(() => {
    const raw = params.get("service");
    if (!raw) return null;
    return isCorporateServiceId(raw) ? raw : "INVALID";
  }, [params]);

  const selectedService = useMemo(() => {
    if (!serviceId || serviceId === "INVALID") return null;
    return CORPORATE_SERVICES.find((s) => s.id === serviceId) ?? null;
  }, [serviceId]);

  const onChange =
    (key: keyof QuoteForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const onServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;

    // si eligen "Selecciona…", removemos el param
    if (!next) {
      setParams((prev) => {
        const p = new URLSearchParams(prev);
        p.delete("service");
        return p;
      });
      return;
    }

    // solo permitimos ids conocidos
    if (!isCorporateServiceId(next)) return;

    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("service", next);
      return p;
    });
  };

  return (
    <section className="quote-page">
      <Container className="py-4">
        <Row className="g-3 align-items-start">
          <Col lg={8}>
            <h1 className="h3 mb-1">Cotizar</h1>
            <div className="text-muted">
              Cuéntanos lo esencial y te respondemos con una propuesta clara.
            </div>

            {serviceId === "INVALID" && (
              <Alert variant="warning" className="mt-3">
                El servicio seleccionado no es válido. 
                Elige uno desde <Link to="/corporativos"><u>Corporativos</u></Link> o <Link to={"/familiares"}> <u>Eventos familiares</u></Link>.
              </Alert>
            )}

            {selectedService && (
              <Card className="border-0 shadow-sm mt-3">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
                    <div>
                      <div className="h5 mb-1">{selectedService.label}</div>
                      <div className="text-muted">{selectedService.subtitle}</div>
                    </div>

                    {selectedService.image?.src && (
                      <img
                        src={selectedService.image.src}
                        alt={selectedService.image.alt}
                        style={{
                          width: 120,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      />
                    )}
                  </div>

                  <ul className="mt-3 mb-0" style={{ color: "rgba(255,255,255,0.78)" }}>
                    {selectedService.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}

            <Card className="border-0 shadow-sm mt-3">
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        value={form.name}
                        onChange={onChange("name")}
                        placeholder="Tu nombre"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Teléfono / WhatsApp</Form.Label>
                      <Form.Control
                        value={form.phone}
                        onChange={onChange("phone")}
                        placeholder="+57 ..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Correo</Form.Label>
                      <Form.Control
                        type="email"
                        value={form.email}
                        onChange={onChange("email")}
                        placeholder="tucorreo@email.com"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Tipo de servicio</Form.Label>
                      <Form.Select
                        value={serviceId && serviceId !== "INVALID" ? serviceId : ""}
                        onChange={onServiceChange}
                      >
                        <option value="">Selecciona…</option>
                        {CORPORATE_SERVICES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Número de personas</Form.Label>
                      <Form.Control
                        value={form.people}
                        onChange={onChange("people")}
                        inputMode="numeric"
                        placeholder="Ej: 30"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control value={form.date} onChange={onChange("date")} type="date" />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Dirección / Lugar</Form.Label>
                      <Form.Control
                        value={form.address}
                        onChange={onChange("address")}
                        placeholder="Empresa, salón, dirección…"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Notas</Form.Label>
                      <Form.Control
                        value={form.notes}
                        onChange={onChange("notes")}
                        as="textarea"
                        rows={4}
                        placeholder="Dietas, horarios, detalles…"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                  <button className="btn btn-outline-warning btn-lg" type="button">
                    Enviar solicitud
                  </button>
                  <Link className="btn btn-outline-secondary btn-lg" to="/corporativos">
                    Volver a corporativos
                  </Link>
                </div>

                <div className="text-muted small mt-3">
                  * El servicio se controla por URL (estable y recargable).
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
