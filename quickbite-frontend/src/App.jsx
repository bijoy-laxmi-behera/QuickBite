import { Routes, Route } from "react-router-dom";

// Public Pages
import Landing from "@/public/pages/Landing";
import Login from "@/auth/pages/Login";
import Register from "@/auth/pages/Register";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword from "@/auth/pages/ResetPassword";

// Admin
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/Dashboard";

// Role Dashboards
import CustomerDashboard from "@/customer/pages/Dashboard";
import VendorDashboard from "@/vendor/pages/VendorLayout";
import DeliveryDashboard from "@/delivery/pages/Dashboard";

import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
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

      {/* VENDOR - Direct access (for development/testing) */}
      <Route path="/vendor" element={<VendorDashboard />} />
      <Route path="/vendor/dashboard" element={<VendorDashboard />} />

      {/* VENDOR - Protected route (for production use) */}
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
    </Routes>
  );
}

export default App;
