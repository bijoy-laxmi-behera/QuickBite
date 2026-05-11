import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/services/axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/logo.png";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async () => {
    try {
      setError("");
      setMessage("");

      const res = await axios.post("/auth/forgot-password", {
        email,
      });

      setMessage(res.data.message);
      setStep(2);
      setTimer(600);

    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      setMessage("");

      const res = await axios.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 p-6 relative overflow-hidden">

      {/* Background glow */}
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
          <div className="w-28 h-28 rounded-full bg-white/30 border border-white/40 shadow-xl flex items-center justify-center mb-4">
            <img src={Logo} alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Forgot Password
          </h1>
        </div>

        {message && (
          <div className="mb-4 text-green-100 bg-green-500/30 border border-green-300/30 p-3 rounded-xl text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-red-100 bg-red-500/30 border border-red-300/30 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">

            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
              />
              <label className="absolute left-4 top-2 text-sm text-white/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
                Email
              </label>
            </div>

            <button
              onClick={handleSendOTP}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:scale-[1.02] transition"
            >
              Send OTP
            </button>

          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white"
            />

            {timer > 0 ? (
              <p className="text-sm text-white/80">
                OTP expires in {formatTime(timer)}
              </p>
            ) : (
              <button
                onClick={handleSendOTP}
                className="text-sm text-white underline"
              >
                Resend OTP
              </button>
            )}

            {/* New Password */}
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
              />

              <label className="absolute left-4 top-2 text-sm text-white/70">
                New Password
              </label>

              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-4 top-4 text-white/70"
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="peer w-full px-4 pt-5 pb-2 bg-white/30 border border-white/30 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white"
              />

              <label className="absolute left-4 top-2 text-sm text-white/70">
                Confirm Password
              </label>

              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-4 top-4 text-white/70"
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleResetPassword}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:scale-[1.02] transition"
            >
              Reset Password
            </button>

          </div>
        )}

      </motion.div>
    </div>
  );
}

export default ForgotPassword;