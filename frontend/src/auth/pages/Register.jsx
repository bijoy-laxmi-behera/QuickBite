import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "@/services/axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logo.png";

const API = import.meta.env.VITE_API_URL;

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
    // Vendor-specific fields
    restaurantName: "",
    restaurantType: "Restaurant",
    cuisine: "",
    address: "",
    city: "",
    pincode: "",
    description: "",
    deliveryTime: "30",
    minOrder: "199"
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

  const validateForm = () => {
    if (!formData.name.trim()) return "Full name is required";
    if (!formData.email.includes("@")) return "Valid email required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (!formData.role) return "Role is required";
    
    // Phone for all roles
    if (!formData.phone.trim()) return "Phone number is required";
    
    // Delivery-specific fields
    if (formData.role === "delivery") {
      if (!formData.vehicle.trim()) return "Vehicle information is required for delivery partners";
      if (!formData.licensePlate.trim()) return "License plate is required for delivery partners";
    }
    
    // Vendor-specific fields
    if (formData.role === "vendor") {
      if (!formData.restaurantName.trim()) return "Restaurant name is required";
      if (!formData.address.trim()) return "Restaurant address is required";
      if (!formData.city.trim()) return "City is required";
      if (!formData.pincode.trim()) return "Pincode is required";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API}/auth/register`, formData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-500 via-red-500 to-yellow-400 p-6 relative overflow-hidden">
      {/* Background blur shapes */}
      <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-10 overflow-y-auto max-h-[90vh]"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-36 h-36 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-2xl flex items-center justify-center mb-6">
            <img
              src={Logo}
              alt="QuickBite Logo"
              className="w-24 h-24 object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-white">QuickBite</h1>

          <p className="text-white/80 text-sm mt-2">Create your account</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
              Full Name
            </label>
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
              Email
            </label>
          </div>

          {/* ROLE DROPDOWN */}
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="" disabled className="text-black">
                Select Role
              </option>
              <option value="customer" className="text-black">
                Customer
              </option>
              <option value="vendor" className="text-black">
                Vendor
              </option>
              <option value="delivery" className="text-black">
                Delivery Partner
              </option>
            </select>
          </div>

          {/* Phone - Required for all roles */}
          <div className="relative">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Phone Number"
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
              Phone Number
            </label>
          </div>

          {/* DELIVERY EXTRA FIELDS - Only shown for delivery role */}
          {formData.role === "delivery" && (
            <>
              {/* Vehicle */}
              <div className="relative">
                <input
                  type="text"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  placeholder="Vehicle (Bike/Car)"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                />
                <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                  Vehicle
                </label>
              </div>

              {/* License Plate */}
              <div className="relative">
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="License Plate"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                />
                <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                  License Plate
                </label>
              </div>
            </>
          )}

          {/* VENDOR EXTRA FIELDS - Only shown for vendor role */}
          {formData.role === "vendor" && (
            <>
              {/* Restaurant Name */}
              <div className="relative">
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  required
                  placeholder="Restaurant Name"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                />
                <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                  Restaurant Name
                </label>
              </div>

              {/* Restaurant Type */}
              <div className="relative">
                <select
                  name="restaurantType"
                  value={formData.restaurantType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="Restaurant" className="text-black">Restaurant</option>
                  <option value="Cloud Kitchen" className="text-black">Cloud Kitchen</option>
                </select>
              </div>

              {/* Cuisine */}
              <div className="relative">
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                  placeholder="Cuisine (comma separated)"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                />
                <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                  Cuisine (e.g., North Indian, Chinese)
                </label>
              </div>

              {/* Address */}
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Street Address"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                />
                <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                  Street Address
                </label>
              </div>

              {/* City and Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                    className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                    City
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="Pincode"
                    className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                    Pincode
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Restaurant Description"
                  className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white resize-none"
                />
                <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                  Description
                </label>
              </div>

              {/* Delivery Time and Min Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleChange}
                    placeholder="Delivery Time (mins)"
                    className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                    Delivery Time (mins)
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleChange}
                    placeholder="Min Order Amount"
                    className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 peer-focus:top-2 peer-focus:text-sm">
                    Min Order (₹)
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Password"
              className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
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

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-orange-500 to-red-600 shadow-lg hover:shadow-xl"
              }`}
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        <p className="text-sm text-white/80 mt-8 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-white hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;