import { useState } from "react";
import { user} from "../../data/user";

function Login({ setRole, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const foundUser = user.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
  alert("Invalid credentials ❌");
  return;
}

localStorage.setItem("user", JSON.stringify(foundUser));
setRole(foundUser.role);
setPage("home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-200">

      {/* Glass Card */}
      <div className="backdrop-blur-lg bg-white/60 border border-white/30 shadow-xl rounded-2xl p-8 w-[90%] max-w-md">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-orange-500 text-center mb-1">
          QuickBite
        </h1>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Welcome back! Login to continue 🍽️
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full mt-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full mt-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition duration-300 shadow-md"
        >
          Login
        </button>

        {/* Demo */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Demo: customer@test.com / 1234
        </p>

      </div>
    </div>
  );
}

export default Login;