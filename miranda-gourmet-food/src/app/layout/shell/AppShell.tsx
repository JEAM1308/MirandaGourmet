import { Outlet } from "react-router-dom";
import AppNavbar from "../navbar/AppNavbar";
import AppFooter from "../footer/AppFooter";
import  "./app-shell.css";

export default function AppShell() {
  return (
    <div className="shell">
      <AppNavbar />

      <div className="page-wrapper">
        <Outlet />
      </div>

      <AppFooter />
    </div>
  );
}
