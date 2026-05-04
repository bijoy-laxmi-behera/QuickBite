import { Routes, Route } from "react-router-dom";

// Public Pages
import Landing from "@/public/pages/Landing";
import Login from "@/auth/pages/Login";
import Register from "@/auth/pages/Register";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword from "@/auth/pages/ResetPassword";

// Dashboards
import AdminDashboard from "@/admin/pages/Dashboard";
import CustomerDashboard from "@/customer/pages/Dashboard";
import VendorDashboard from "@/vendor/pages/VendorLayout";
import DeliveryDashboard from "@/delivery/pages/Dashboard";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      {/* ✅ TOASTER OUTSIDE ROUTES */}
      <Toaster
        position="top-center"
        containerClassName="pointer-events-none"
        toastOptions={{
          className: "pointer-events-auto",
        }}
      />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* CUSTOMER */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* VENDOR */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        {/* DELIVERY */}
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute allowedRoles={["delivery"]}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div>Page Not Found</div>} />

      </Routes>
    </>
  );
}

export default App;