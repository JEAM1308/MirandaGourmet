import { Outlet } from "react-router-dom";
import AppNavbar from "./Navbar";
import AppFooter from "./footer/AppFooter";

export default function AppShell(){
    return (
        <>
        <AppNavbar />
        <main>
            <Outlet/>
        </main>
        <AppFooter />
        </>
    );
}