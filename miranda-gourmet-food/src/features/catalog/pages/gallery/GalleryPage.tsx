import { Alert, Carousel, Container } from "react-bootstrap";

import "./gallery.css";

type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
};

// Para actualizar la galería solo agrega/quita URLs aquí.
const GALLERY_IMAGES: GalleryImage[] = [
  { src: "/assets/gallery/a.png", alt: "food photos", caption: "Reference: a" },
  { src: "/assets/gallery/b.png", alt: "food photos", caption: "Reference: b" },
  { src: "/assets/gallery/c.png", alt: "food photos", caption: "Reference: c" },
  { src: "/assets/gallery/d.png", alt: "food photos", caption: "Reference: d" },
  { src: "/assets/gallery/e.png", alt: "food photos", caption: "Reference: e" },
  { src: "/assets/gallery/f.png", alt: "food photos", caption: "Reference: f" },
  { src: "/assets/gallery/g.png", alt: "food photos", caption: "Reference: g" },
  { src: "/assets/gallery/h.jpg", alt: "food photos", caption: "Reference: h" },
  { src: "/assets/gallery/i.jpg", alt: "food photos", caption: "Reference: i" },
  { src: "/assets/gallery/j.jpg", alt: "food photos", caption: "Reference: j" },
  { src: "/assets/gallery/k.jpg", alt: "food photos", caption: "Reference: k" },
  { src: "/assets/gallery/l.jpg", alt: "food photos", caption: "Reference: l" },
];

export default function GalleryPage() {
  return (
    <section className="gallery-page section"
    style={{ backgroundImage: `url(/assets/bg/gallery/bg.jpg)` }}>
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
