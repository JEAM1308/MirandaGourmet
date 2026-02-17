import { Outlet } from "react-router-dom";
import AppNavbar from "./navbar/AppNavbar";
import AppFooter from "./footer/AppFooter";

export default function AppShell() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
