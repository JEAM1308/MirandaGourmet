import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsWhatsapp, BsEnvelope, BsGeo } from "react-icons/bs";

export default function AppFooter() {
  const year = new Date().getFullYear();

  const waText = encodeURIComponent( "Hola Miranda Gourmet, quiero más información sobre sus servicios.");
  const emailSubject = encodeURIComponent("Hola Miranda Gourmet");
  const emailBody = encodeURIComponent("Hola, me gustaría conocer más sobre sus servicios.");

  return (
    <footer className="foot-root">
      <div className="foot-overlay" />
      <Container className="foot-content">
        <Row className="gy-4">
          <Col md={6}>
            <div className="foot-brand">Miranda Gourmet Food</div>
            <div className="foot-tagline">
              Experiencias gastronómicas para eventos corporativos y familiares.
            </div>
          </Col>

          <Col md={3}>
            <div className="foot-sectionTitle">Servicios</div>
            <ul className="foot-linkList">
              <li>
                <Link to="/corporativos" className="foot-link">
                  Corporativos
                </Link>
              </li>
              <li>
                <Link to="/familiares" className="foot-link">
                  Familiares
                </Link>
              </li>
              <li>
                <Link to="/quote" className="foot-link">
                  Eventos personalizados
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={3}>
            <div className="foot-sectionTitle">Contacto</div>
            <ul className="foot-linkList">
              <li>
                <a
                  className="foot-link"
                  href={`https://wa.me/573014577319?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BsWhatsapp /> Escríbenos por WhatsApp
                </a>
              </li>

              <li>
                
                <a className="foot-link" href={`mailto:mailto:comercial@mirandagourmetfood.com?subject=${emailSubject}&body=${emailBody}`}>
                  <BsEnvelope /> comercial@mirandagourmetfood.com
                </a>
              </li>

              <li className="foot-metaLine">
                <BsGeo /> Bogotá, Colombia
              </li>
            </ul>
          </Col>
        </Row>

        <div className="foot-bottomBar">
          <div className="foot-meta">© {year} — Miranda Gourmet Food</div>
          <div className="foot-meta">
            <a href="https://www.jeamdev.com">Web desarrollada por <span className="foot-dev metal-gold">J.E.A.M Dev</span></a> 
          </div>
        </div>
      </Container>
    </footer>
  );
}
