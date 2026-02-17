import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import { Outlet, useLocation } from "react-router-dom";
import AppNavbar from "./Navbar";
import AppFooter from "./Footer";

type BackgroundSpec = {
  imageUrl?: string;          // fondo con imagen
  color?: string;             // fallback (ej: "#0b0b0c")
  overlay?: "none" | "light" | "dark"; // capa para legibilidad
  position?: string;          // "center" etc
  size?: string;              // "cover"
  repeat?: string;            // "no-repeat"
  attachment?: "scroll" | "fixed"; // efecto pro (fixed)
};

function getBackgroundForPath(pathname: string): BackgroundSpec {
  if (pathname === "/") {
    return {
      // Pon aquí tu imagen hero/home si quieres que toda la Home tenga “mood”
      imageUrl: "/assets/bg/home.png",
      color: "#0b0b0c",
      overlay: "dark",
      position: "center",
      size: "cover",
      repeat: "no-repeat",
      attachment: "scroll",
    };
  }

  if (pathname.startsWith("/corporativos")) {
    return {
      imageUrl: "/assets/bg/corporate.jpg",
      color: "#0b0b0c",
      overlay: "dark",
      position: "center",
      size: "cover",
      repeat: "no-repeat",
      attachment: "fixed",
    };
  }

  if (pathname.startsWith("/familiares")) {
    return {
      imageUrl: "/assets/bg/family.jpg",
      color: "#0b0b0c",
      overlay: "dark",
      position: "center",
      size: "cover",
      repeat: "no-repeat",
      attachment: "fixed",
    };
  }

  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) {
    // Checkout y carrito: mejor fondo limpio para confianza
    return {
      color: "#ffffff",
      overlay: "none",
    };
  }

  return {
    color: "#ffffff",
    overlay: "none",
  };
}

function overlayStyle(overlay: BackgroundSpec["overlay"]): React.CSSProperties {
  if (overlay === "dark") {
    return { background: "rgba(0,0,0,0.55)" };
  }
  if (overlay === "light") {
    return { background: "rgba(255,255,255,0.65)" };
  }
  return { background: "transparent" };
}

export default function AppLayout() {
  const location = useLocation();

  const bg = useMemo(() => getBackgroundForPath(location.pathname), [location.pathname]);

  const wrapperStyle: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      minHeight: "100vh",
      backgroundColor: bg.color ?? "#ffffff",
      position: "relative",
    };

    if (bg.imageUrl) {
      base.backgroundImage = `url(${bg.imageUrl})`;
      base.backgroundPosition = bg.position ?? "center";
      base.backgroundSize = bg.size ?? "cover";
      base.backgroundRepeat = bg.repeat ?? "no-repeat";
      base.backgroundAttachment = bg.attachment ?? "scroll";
    }

    return base;
  }, [bg]);

  return (<>
    <AppNavbar />
    <div className="d-flex flex-column" style={wrapperStyle}>

      {/* Overlay opcional para legibilidad sobre imagen */}
      <div style={{ ...overlayStyle(bg.overlay), flex: 1 }}>
        <main className="flex-grow-1">
        <Container className="py-4">
            <Outlet />
        </Container>
        </main>
      </div>
      
    </div>
    <AppFooter />
    </>
  );
}
