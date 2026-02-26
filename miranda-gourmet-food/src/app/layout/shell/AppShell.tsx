import { Outlet } from "react-router-dom";
import { BsWhatsapp } from "react-icons/bs";
import AppNavbar from "../navbar/AppNavbar";
import AppFooter from "../footer/AppFooter";

export default function AppShell() {
  const waText = encodeURIComponent(
    "Hola Miranda Gourmet, quiero mas informacion sobre sus servicios.",
  );

  return (
    <div className="shell">
      <AppNavbar />

      <div className="page-wrapper">
        <Outlet />
      </div>

      <AppFooter />

      <div className="floating-whatsapp-wrap">
        <span className="floating-whatsapp-label">¡Hablemos!</span>
        <a
          className="floating-whatsapp"
          href={`https://wa.me/573014577319?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Contactar por WhatsApp"
        >
          <BsWhatsapp />
        </a>
      </div>
    </div>
  );
}
