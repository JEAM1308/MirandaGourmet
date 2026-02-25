import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../layout/shell/AppShell";
import CartPage from "../../features/cart/pages/CartPage";
import CheckoutSuccessPage from "../../features/checkout/pages/CheckoutSuccessPage";
import CheckoutCancelPage from "../../features/checkout/pages/CheckoutCancelPage";
import PayWompiPage from "../../features/payments/pages/PayWompiPage";
import WompiResultPage from "../../features/payments/pages/WompiResultPage";

import HomePage from "../../features/catalog/pages/home/HomePage";
import CorporativosPage from "../../features/catalog/pages/corporativos/CorporativosPage";
import QuotePage from "../../features/catalog/pages/quote/QuotePage";
import OrderDetailsPage from "../../features/orders/pages/OrderDetailPage";


export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/corporativos" element={<CorporativosPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
        <Route path="/pay/wompi" element={<PayWompiPage />} />
        <Route path="/checkout/wompi-result" element={<WompiResultPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
