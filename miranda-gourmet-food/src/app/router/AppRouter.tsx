import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../layout/AppLayout";

import CartPage from "../../features/cart/pages/CartPage";
import CheckoutSuccessPage from "../../features/checkout/pages/CheckoutSuccessPage";
import CheckoutCancelPage from "../../features/checkout/pages/CheckoutCancelPage";

import HomePage from "../../features/catalog/pages/HomePage";


function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="h4">{title}</h1>
      <p className="text-muted mb-0">En construcción.</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/corporativos" element={<ComingSoon title="Corporativos" />} />
        <Route path="/familiares" element={<ComingSoon title="Eventos familiares" />} />
        <Route path="/quote" element={<ComingSoon title="Cotizar" />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
