import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/services/axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logo.png";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    vehicle: "",
    licensePlate: "",
    restaurantName: "",
    restaurantType: "Restaurant",
    cuisine: "",
    address: "",
    city: "",
    pincode: "",
    description: "",
    deliveryTime: "30",
    minOrder: "199",
  });

  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.name.trim())                     return "Full name is required";
    if (!formData.email.includes("@"))             return "Valid email required";
    if (formData.password.length < 6)              return "Password must be at least 6 characters";
    if (!formData.role)                            return "Role is required";
    if (!formData.phone.trim())                    return "Phone number is required";

    if (formData.role === "delivery") {
      if (!formData.vehicle.trim())                return "Vehicle is required";
      if (!formData.licensePlate.trim())           return "License plate is required";
    }

    if (formData.role === "vendor") {
      if (!formData.restaurantName.trim())         return "Restaurant name is required";
      if (!formData.address.trim())                return "Address is required";
      if (!formData.city.trim())                   return "City is required";
      if (!formData.pincode.trim())                return "Pincode is required";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ✅ Use the configured axios instance — DON'T prepend API URL
      const res = await axios.post("/auth/register", formData);

      setSuccess(res.data.message || "Account created! Redirecting to login...");

      // Vendor accounts need admin approval, so just go to login
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 p-6 relative overflow-hidden">

      {/* Background blur */}
      <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl top-10 left-10 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl bottom-10 right-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-xl flex items-center justify-center mb-4">
            <img src={Logo} alt="QuickBite Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-white/80 text-xs mt-1">Join QuickBite today</p>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 text-red-100 bg-red-500/30 border border-red-300/30 p-3 rounded-xl text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 text-green-100 bg-green-500/30 border border-green-300/30 p-3 rounded-xl text-sm"
          >
            ✅ {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Common Fields */}
          <FloatingInput name="name"  type="text"  value={formData.name}  onChange={handleChange} label="Full Name" required />
          <FloatingInput name="email" type="email" value={formData.email} onChange={handleChange} label="Email"     required />
          <FloatingInput name="phone" type="text"  value={formData.phone} onChange={handleChange} label="Phone Number" required />

          {/* Role */}
          <select
            name="role" value={formData.role} onChange={handleChange} required
            className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="" disabled className="text-black">Select Role</option>
            <option value="customer" className="text-black">Customer</option>
            <option value="vendor"   className="text-black">Vendor</option>
            <option value="delivery" className="text-black">Delivery Partner</option>
          </select>

          {/* DELIVERY FIELDS */}
          {formData.role === "delivery" && (
            <>
              <FloatingInput name="vehicle"      value={formData.vehicle}      onChange={handleChange} label="Vehicle (Bike/Car)" />
              <FloatingInput name="licensePlate" value={formData.licensePlate} onChange={handleChange} label="License Plate" />
            </>
          )}

          {/* VENDOR FIELDS */}
          {formData.role === "vendor" && (
            <>
              <FloatingInput name="restaurantName" value={formData.restaurantName} onChange={handleChange} label="Restaurant Name" required />

              <select
                name="restaurantType" value={formData.restaurantType} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="Restaurant"    className="text-black">🍴 Restaurant</option>
                <option value="Cloud Kitchen" className="text-black">☁️ Cloud Kitchen</option>
              </select>

              <FloatingInput name="cuisine"  value={formData.cuisine}  onChange={handleChange} label="Cuisine (comma separated)" />
              <FloatingInput name="address"  value={formData.address}  onChange={handleChange} label="Street Address" required />

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput name="city"    value={formData.city}    onChange={handleChange} label="City" required />
                <FloatingInput name="pincode" value={formData.pincode} onChange={handleChange} label="Pincode" required />
              </div>

              <div className="relative">
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  rows="2" placeholder="Restaurant Description"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white resize-none"
                />
                <label className="absolute left-4 top-2 text-xs text-white/70">Description</label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput type="number" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} label="Delivery (min)" />
                <FloatingInput type="number" name="minOrder"     value={formData.minOrder}     onChange={handleChange} label="Min Order (₹)" />
              </div>
            </>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password" value={formData.password} onChange={handleChange}
              required minLength={6} placeholder="Password"
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <label className="absolute left-4 top-2 text-xs text-white/70">Password</label>
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-white/70 hover:text-white">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            type="submit" disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed"
                     : "bg-gradient-to-r from-orange-500 to-red-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? "Creating account..." : "Register"}
          </motion.button>
        </form>

        <p className="text-sm text-white/80 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-white hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Reusable Floating Input ─────────────────────────────
function FloatingInput({ name, type = "text", value, onChange, label, required }) {
  return (
    <div className="relative">
      <input
        type={type} name={name} value={value} onChange={onChange} required={required} placeholder={label}
        className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
      />
      <label className="absolute left-4 top-2 text-xs text-white/70 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-xs">
        {label}
      </label>
    </div>
  );
}

export default Register;