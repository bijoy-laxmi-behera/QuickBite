import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  // Get auth data
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const role = (user?.role || "").toLowerCase();

  // Normalize allowed roles
  const normalizedRoles = allowedRoles.map((r) => r.toLowerCase());

  // ================= NOT LOGGED IN =================
  if (!user || !token) {
    // Admin routes go to admin login
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Others go to normal login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ================= INVALID USER DATA =================
  if (!role) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // ================= ROLE CHECK =================
  if (normalizedRoles.length > 0 && !normalizedRoles.includes(role)) {
    // Redirect to correct dashboard instead of "/"
    switch (role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "vendor":
        return <Navigate to="/vendor/dashboard" replace />;
      case "customer":
        return <Navigate to="/customer/home" replace />;
      case "delivery":
        return <Navigate to="/delivery/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // ================= AUTHORIZED =================
  return children;
}

export default ProtectedRoute;