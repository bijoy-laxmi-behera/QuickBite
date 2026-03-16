import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // No token → go to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Token exists but user data is missing/corrupted
  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }

  // Role not allowed → go to home
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}