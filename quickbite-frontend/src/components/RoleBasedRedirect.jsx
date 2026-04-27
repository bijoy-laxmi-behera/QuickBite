import { Navigate } from "react-router-dom";

const RoleBasedRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ================= NO USER =================
  if (!user || !user.role) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toLowerCase();

  // ================= ROLE ROUTING =================
  switch (role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;

    case "vendor":
      return <Navigate to="/vendor/dashboard" replace />;

    case "delivery":
      return <Navigate to="/delivery/dashboard" replace />;

    case "customer":
      return <Navigate to="/customer/home" replace />;

    default:
      // Unknown role → reset session
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;