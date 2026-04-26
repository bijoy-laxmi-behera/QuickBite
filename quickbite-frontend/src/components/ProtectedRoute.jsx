import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const role = (user?.role || "").toLowerCase();

  // 🔴 NOT logged in
  if (!user || !token) {
    // 👉 if trying admin route → go to admin login
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // 🔴 Wrong role
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return children;
}

export default ProtectedRoute;