import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ─── Public ───────────────────────────────────────────────
import Landing        from "@/public/pages/Landing";
import Login          from "@/auth/pages/Login";
import Register       from "@/auth/pages/Register";
import ForgotPassword from "@/auth/pages/ForgotPassword";
import ResetPassword  from "@/auth/pages/ResetPassword";

// ─── Layouts ──────────────────────────────────────────────
import AdminDashboard    from "@/admin/AdminLayout";
import CustomerDashboard from "@/customer/CustomerLayout";
import VendorDashboard   from "@/vendor/VendorLayout";
import DeliveryLayout    from "@/delivery/DeliveryLayout";

// ─── Delivery Pages ────────────────────────────────────────
import Dashboard      from "@/delivery/pages/Dashboard";
import IncomingOrders from "@/delivery/pages/IncomingOrders";
import ActiveOrder    from "@/delivery/pages/ActiveOrder";
import OrderHistory   from "@/delivery/pages/OrderHistory";
import Earnings       from "@/delivery/pages/Earnings";
import Wallet         from "@/delivery/pages/Wallet";
import Profile        from "@/delivery/pages/Profile";
import Notifications  from "@/delivery/pages/Notifications";
import Performance    from "@/delivery/pages/Performance";
import Support        from "@/delivery/pages/Support";

// ─── Protection ───────────────────────────────────────────
import ProtectedRoute from "@/components/ProtectedRoute";

const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.role || null;
  } catch { return null; }
};

function RoleRedirect() {
  const role = getUserRole();
  switch (role) {
    case "admin":    return <Navigate to="/admin/dashboard"    replace />;
    case "customer": return <Navigate to="/customer/home"      replace />;
    case "vendor":   return <Navigate to="/vendor/dashboard"   replace />;
    case "delivery": return <Navigate to="/delivery/dashboard" replace />;
    default:         return <Navigate to="/login"              replace />;
  }
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F3] px-4">
      <p className="text-[140px] font-black text-orange-100 leading-none select-none">404</p>
      <h1 className="text-2xl font-bold text-gray-800 -mt-6 mb-2">Page Not Found</h1>
      <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)}
          className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition">
          Go Back
        </button>
        <button onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition">
          Home
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Routes>

        <Route path="/"                element={<Landing />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        <Route path="/dashboard" element={<RoleRedirect />} />

        <Route path="/home"                  element={<Navigate to="/customer/home"                  replace />} />
        <Route path="/cart"                  element={<Navigate to="/customer/cart"                  replace />} />
        <Route path="/checkout"              element={<Navigate to="/customer/checkout"              replace />} />
        <Route path="/favourites"            element={<Navigate to="/customer/favourites"            replace />} />
        <Route path="/orders"                element={<Navigate to="/customer/orders"                replace />} />
        <Route path="/order-success"         element={<Navigate to="/customer/order-success"         replace />} />
        <Route path="/payments"              element={<Navigate to="/customer/payments"              replace />} />
        <Route path="/profile"               element={<Navigate to="/customer/profile"               replace />} />
        <Route path="/reviews"               element={<Navigate to="/customer/reviews"               replace />} />
        <Route path="/addresses"             element={<Navigate to="/customer/addresses"             replace />} />
        <Route path="/notifications"         element={<Navigate to="/customer/notifications"         replace />} />
        <Route path="/subscription-checkout" element={<Navigate to="/customer/subscription-checkout" replace />} />
        <Route path="/subscription-success"  element={<Navigate to="/customer/subscription-success"  replace />} />
        <Route path="/order-tracking/*"      element={<Navigate to="/customer/order-tracking"        replace />} />
        <Route path="/restaurant/*"          element={<Navigate to="/customer/restaurant"            replace />} />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
        } />

        <Route path="/customer/*" element={
          <ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>
        } />

        <Route path="/vendor/*" element={
          <ProtectedRoute allowedRoles={["vendor"]}><VendorDashboard /></ProtectedRoute>
        } />

        <Route
          path="/delivery"
          element={
            <ProtectedRoute allowedRoles={["delivery"]}>
              <DeliveryLayout />
            </ProtectedRoute>
          }
        >
          <Route index                  element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />}      />
          <Route path="orders/incoming" element={<IncomingOrders />} />
          <Route path="orders/active"   element={<ActiveOrder />}    />
          <Route path="orders/history"  element={<OrderHistory />}   />
          <Route path="earnings"        element={<Earnings />}       />
          <Route path="wallet"          element={<Wallet />}         />
          <Route path="profile"         element={<Profile />}        />
          <Route path="notifications"   element={<Notifications />}  />
          <Route path="performance"     element={<Performance />}    />
          <Route path="support"         element={<Support />}        />
          <Route path="*"               element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
}

export default App;