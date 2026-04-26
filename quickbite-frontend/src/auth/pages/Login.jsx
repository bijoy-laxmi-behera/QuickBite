import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logo.png";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const roleToRoute = {
    admin: "/admin/dashboard",
    customer: "/customer/dashboard",
    vendor: "/vendor/dashboard",
    delivery: "/delivery/dashboard",
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

      const res = await axios.post(`${API}/api/auth/login`, formData);

      // 🔎 Debug (remove after verification)
      console.log("LOGIN RESPONSE:", res.data);

      // ✅ Save token
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      // ✅ Normalize user object
      const user = res.data?.user || res.data;
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Extract role safely
      const role = (user?.role || user?.Role || "").toLowerCase();

      // ✅ Navigate based on role
      const target = roleToRoute[role];
      if (target) {
        navigate(target, { replace: true });
      } else {
        // Fallback if role missing/invalid
        navigate("/", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 p-6 relative overflow-hidden">
      {/* Background blur shapes */}
      <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={Logo} alt="QuickBite Logo" className="w-16 mb-4" />
          <h1 className="text-3xl font-bold text-white tracking-wide">
            QuickBite
          </h1>
          <p className="text-white/80 text-sm mt-2">
            Sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-red-100 bg-red-500/30 border border-red-300/30 p-3 rounded-xl text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Email"
            />
            <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Password"
            />
            <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-4 text-white/70 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-white/80 hover:text-white transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-600 shadow-lg hover:shadow-xl"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        {/* Register */}
        <p className="text-sm text-white/80 mt-8 text-center">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-white hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;