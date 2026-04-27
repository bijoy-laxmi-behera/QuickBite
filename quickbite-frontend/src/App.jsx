import { Routes, Route, Navigate } from "react-router-dom";

// ================= PUBLIC =================
import Landing from "@/public/pages/Landing";
import Login from "@/auth/pages/Login";
import Register from "@/auth/pages/Register";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword from "@/auth/pages/ResetPassword";

// ================= ADMIN =================
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/Dashboard";

// ================= CUSTOMER =================
import CustomerLayout from "@/customer/pages/CustomerLayout";
import Home from "@/customer/pages/Home";
import Cart from "@/customer/pages/Cart";
import Orders from "@/customer/pages/Orders";
import CustomerProfile from "@/customer/pages/Profile";
import Favourites from "@/customer/pages/Favourites";
import Restaurant from "@/customer/pages/Restaurant";
import Checkout from "@/customer/pages/Checkout";
import OrderTracking from "@/customer/pages/OrderTracking";
import OrderSuccess from "@/customer/pages/OrderSuccess";
import Payments from "@/customer/pages/Payments";
import Addresses from "@/customer/pages/Addresses";
import Reviews from "@/customer/pages/Reviews";
import Notifications from "@/customer/pages/Notifications";
import SubscriptionCheckout from "@/customer/pages/SubscriptionCheckout";
import SubscriptionSuccess from "@/customer/pages/SubscriptionSuccess";

// ================= VENDOR =================
import VendorLayout from "@/vendor/pages/VendorLayout";

// ================= DELIVERY =================
import DeliveryLayout from "@/delivery/pages/DeliveryLayout";

// ================= PROTECTION =================
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= CUSTOMER ================= */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home"                  element={<Home />} />
        <Route path="cart"                  element={<Cart />} />
        <Route path="orders"                element={<Orders />} />
        <Route path="profile"               element={<CustomerProfile />} />
        <Route path="favourites"            element={<Favourites />} />
        <Route path="restaurant"            element={<Restaurant />} />
        <Route path="checkout"              element={<Checkout />} />
        <Route path="order-tracking"        element={<OrderTracking />} />
        <Route path="order-success"         element={<OrderSuccess />} />
        <Route path="payments"              element={<Payments />} />
        <Route path="addresses"             element={<Addresses />} />
        <Route path="reviews"               element={<Reviews />} />
        <Route path="notifications"         element={<Notifications />} />
        <Route path="subscription-checkout" element={<SubscriptionCheckout />} />
        <Route path="subscription-success"  element={<SubscriptionSuccess />} />
      </Route>

      {/* Redirect old customer/dashboard path */}
      <Route
        path="/customer/dashboard"
        element={<Navigate to="/customer/home" replace />}
      />

      {/* ================= VENDOR ================= */}
      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />

      {/* ================= DELIVERY ================= */}
      <Route
        path="/delivery/dashboard"
        element={
          <ProtectedRoute allowedRoles={["delivery"]}>
            <DeliveryLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/delivery" element={<Navigate to="/delivery/dashboard" replace />} />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;