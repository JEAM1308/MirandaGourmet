import { Outlet } from "react-router-dom";
import AppNavbar from "./Navbar";
import AppFooter from "./Footer";

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