import { Routes, Route, Navigate } from "react-router-dom";

// Public
import Landing from "@/public/pages/Landing";
import Login from "@/auth/pages/Login";
import Register from "@/auth/pages/Register";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword from "@/auth/pages/ResetPassword";

// Dashboards
import AdminDashboard from "@/admin/AdminLayout";
import CustomerDashboard from "@/customer/CustomerLayout";
import VendorDashboard from "@/vendor/VendorLayout";
import DeliveryDashboard from "@/delivery/DeliveryLayout";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// ✅ Helper: get role from token
const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
};

function App() {
  const role = getUserRole();

  return (
    <>
      <Toaster position="top-center" />

      <Routes>

        {/* ── PUBLIC ──────────────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── AUTO REDIRECT AFTER LOGIN ───────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            role === "admin"    ? <Navigate to="/admin/dashboard"    replace /> :
            role === "customer" ? <Navigate to="/customer/home"      replace /> :
            role === "vendor"   ? <Navigate to="/vendor/dashboard"   replace /> :
            role === "delivery" ? <Navigate to="/delivery/dashboard" replace /> :
            <Navigate to="/login" replace />
          }
        />

        {/* ── SHORT URL REDIRECTS (e.g. /home → /customer/home) ───── */}
        <Route path="/home"                    element={<Navigate to="/customer/home"                  replace />} />
        <Route path="/cart"                    element={<Navigate to="/customer/cart"                  replace />} />
        <Route path="/checkout"                element={<Navigate to="/customer/checkout"              replace />} />
        <Route path="/favourites"              element={<Navigate to="/customer/favourites"            replace />} />
        <Route path="/orders"                  element={<Navigate to="/customer/orders"                replace />} />
        <Route path="/order-success"           element={<Navigate to="/customer/order-success"         replace />} />
        <Route path="/order-tracking/:id"      element={<Navigate to="/customer/order-tracking/:id"    replace />} />
        <Route path="/payments"                element={<Navigate to="/customer/payments"              replace />} />
        <Route path="/profile"                 element={<Navigate to="/customer/profile"               replace />} />
        <Route path="/restaurant/:id"          element={<Navigate to="/customer/restaurant/:id"        replace />} />
        <Route path="/reviews"                 element={<Navigate to="/customer/reviews"               replace />} />
        <Route path="/addresses"               element={<Navigate to="/customer/addresses"             replace />} />
        <Route path="/notifications"           element={<Navigate to="/customer/notifications"         replace />} />
        <Route path="/subscription-checkout"   element={<Navigate to="/customer/subscription-checkout" replace />} />
        <Route path="/subscription-success"    element={<Navigate to="/customer/subscription-success"  replace />} />

        {/* ── ADMIN ───────────────────────────────────────────────── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── CUSTOMER ────────────────────────────────────────────── */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── VENDOR ──────────────────────────────────────────────── */}
        <Route
          path="/vendor/*"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── DELIVERY ────────────────────────────────────────────── */}
        <Route
          path="/delivery/*"
          element={
            <ProtectedRoute allowedRoles={["delivery"]}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────────────── */}
        <Route path="*" element={<div>Page Not Found</div>} />

      </Routes>
    </>
  );
}

export default App;