import { Alert, Carousel, Container } from "react-bootstrap";

import "./gallery.css";

type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
};

// Para actualizar la galería solo agrega/quita URLs aquí.
const GALLERY_IMAGES: GalleryImage[] = [
  { src: "/assets/pagephotos/Corp.jpeg", alt: "Evento corporativo", caption: "Eventos corporativos" },
  { src: "/assets/services/corporativos/eventos.png", alt: "Catering para eventos", caption: "Montajes y logística" },
  { src: "/assets/services/corporativos/lunch-box.png", alt: "Lunch Box", caption: "Productos" },
];

export default function GalleryPage() {
  return (
    <section className="gallery-page section">
      <div className="gallery-overlay" />

      <Container className="gallery-content">
        <header className="gallery-header glass-dark">
          <div className="text-uppercase small fw-semibold text-muted mb-2">Galería</div>
          <h1 className="h3 mb-1">Productos y eventos</h1>
          <div className="text-muted2">
            Fotos reales de montajes, servicios y experiencias.
          </div>
        </header>

        <div className="gallery-carouselWrap glass-card shadow-sm">
          {GALLERY_IMAGES.length === 0 ? (
            <Alert variant="warning" className="m-0">
              No hay imágenes configuradas. Agrega URLs en <code>GALLERY_IMAGES</code>.
            </Alert>
          ) : (
            <Carousel className="gallery-carousel" interval={6000}>
              {GALLERY_IMAGES.map((img) => (
                <Carousel.Item key={img.src}>
                  <img
                    className="d-block w-100 gallery-carouselImg"
                    src={img.src}
                    alt={img.alt ?? "Imagen de galería"}
                    loading="lazy"
                  />
                  {(img.caption ?? "").trim().length > 0 && (
                    <Carousel.Caption className="gallery-caption">
                      <div className="gallery-captionText">{img.caption}</div>
                    </Carousel.Caption>
                  )}
                </Carousel.Item>
              ))}
            </Carousel>
          )}
        </div>
      </Container>
    </section>
  );
}
