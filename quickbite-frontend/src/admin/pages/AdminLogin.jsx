/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      if (data.user?.role !== "admin") {
        setError("Access denied. Admin accounts only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">

      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden">

        {/* Background glow blobs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-20 left-[-80px] w-[420px] h-[420px] rounded-full bg-orange-500/20 blur-[120px]" />
          <div className="absolute -bottom-15 -right-15 w-[320px] h-80 rounded-full bg-orange-400/10 blur-[100px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/30">
            🍔
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Quick<span className="text-orange-400">Bite</span>
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs font-semibold text-orange-400 tracking-widest uppercase">
              Admin Portal
            </span>
          </div>

          <h2 className="text-5xl font-black text-white leading-tight">
            Control
            <br />
            <span className="text-orange-400">Everything.</span>
          </h2>

          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Manage users, vendors, orders, meal plans, and delivery agents — all from one powerful dashboard.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: "2.8k+", label: "Users" },
              { value: "62", label: "Vendors" },
              { value: "348", label: "Orders Today" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-xl font-black text-orange-400">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="relative z-10 text-xs text-gray-600">
          © {new Date().getFullYear()} QuickBite. Restricted access.
        </p>
      </div>

      {/* ─── Right Panel (Form) ─── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-base">🍔</div>
            <span className="text-xl font-black text-gray-800">Quick<span className="text-orange-500">Bite</span></span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-100 p-8">

            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Sign In</h1>
              <p className="text-sm text-gray-400 mt-1">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@quickbite.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all placeholder:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="text-red-500 text-sm flex-shrink-0">⚠️</span>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In to Admin Panel →"
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300 font-medium">restricted access</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3.5">
              <span className="text-orange-400 text-base flex-shrink-0 mt-0.5">🛡️</span>
              <p className="text-xs text-orange-700 leading-relaxed">
                This portal is restricted to authorized administrators only. All activity is logged and monitored.
              </p>
            </div>

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Not an admin?{" "}
            <a href="/login" className="text-orange-500 font-semibold hover:underline">
              Go to regular login
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
