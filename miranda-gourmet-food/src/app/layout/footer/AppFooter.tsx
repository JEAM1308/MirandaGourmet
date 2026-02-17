import { Container, Row, Col } from "react-bootstrap";
import styles from "./AppFooter.module.css";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerOverlay} />
      <Container className={styles.footerContent}>
        <Row className="gy-4">
          <Col md={6}>
            <div className={styles.brand}>
              Miranda Gourmet Food
            </div>
            <div className={styles.tagline}>
              Experiencias gastronómicas para eventos corporativos y familiares.
            </div>
          </Col>

          <Col md={3}>
            <div className={styles.sectionTitle}>Servicios</div>
            <ul className={styles.linkList}>
              <li><a href="/corporativos">Corporativos</a></li>
              <li><a href="/familiares">Familiares</a></li>
              <li><a href="/quote">Eventos personalizados</a></li>
            </ul>
          </Col>

          <Col md={3}>
            <div className={styles.sectionTitle}>Contacto</div>
            <ul className={styles.linkList}>
              <li>contacto@mirandagourmet.com</li>
              <li>Bogotá, Colombia</li>
            </ul>
          </Col>
        </Row>

        <div className={styles.bottomBar}>
          <div>© {year} Miranda Gourmet Food</div>
          <div className={styles.devCredit}>
            Developed by <span>JEAM Dev</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
