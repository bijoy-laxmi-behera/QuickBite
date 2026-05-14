import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "@/services/axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData]       = useState({ email: "", password: "" });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user?.role) {
      redirectByRole(user.role);
    }
  }, []);

  const redirectByRole = (role) => {
    switch (role) {
      case "admin":           navigate("/admin/dashboard");    break;
      case "vendor":          navigate("/vendor/dashboard");   break;
      case "delivery":
      case "deliveryPartner": navigate("/delivery/dashboard"); break;
      default:                navigate("/customer/home");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("/auth/login", formData);

      // Backend may return either `token` or `accessToken`
      const token = res.data.token || res.data.accessToken;
      const user  = res.data.user || res.data.data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response from server");
      }

      // ✅ Save everything needed
      localStorage.setItem("token", token);
      localStorage.setItem("user",  JSON.stringify(user));
      localStorage.setItem("role",  user.role);

      // ✅ Redirect by role
      redirectByRole(user.role);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 p-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl top-10 left-10 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl bottom-10 right-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-10"
      >

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={Logo} alt="QuickBite Logo" className="w-16 mb-4" />
          <h1 className="text-3xl font-bold text-white">QuickBite</h1>
          <p className="text-white/80 text-sm mt-2">Sign in to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-100 bg-red-500/30 p-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-white/30 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-white hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-red-600 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-white mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="underline font-semibold">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;