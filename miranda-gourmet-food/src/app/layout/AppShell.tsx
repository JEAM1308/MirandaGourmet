import { Outlet } from "react-router-dom";
import AppNavbar from "./navbar/AppNavbar";
import AppFooter from "./footer/AppFooter";
import styles from "./AppShell.module.css";

export default function AppShell() {
  return (
    <div className={styles.shell}>
      <AppNavbar />

      <div className={styles.pageWrapper}>
        <Outlet />
      </div>

      <AppFooter />
    </div>
  );
}
