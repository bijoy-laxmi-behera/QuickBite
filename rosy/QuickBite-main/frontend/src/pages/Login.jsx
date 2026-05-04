import React, { useState } from "react";
import Logo from "../assets/logo.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-yellow-400 p-6">

      <div className="relative w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">

        {/* Left Side Branding */}
        <div className="w-1/2 bg-gradient-to-br from-yellow-600 to-red-600 text-white p-10 flex flex-col justify-center relative">

        <h1 className="text-4xl font-bold mb-4 flex items-center">
          <img src={Logo} alt="QuickBite Logo" className="w-40 h-24 object-contain" />
          <span className="mb-7">QuickBite</span>
          <img src={Logo} alt="QuickBite Logo" className="w-40 h-24 object-contain" />
        </h1>


          <h2 className="text-3xl font-semibold mb-2">
            {isLogin ? "Welcome Back!" : "Join QuickBite!"}
          </h2>

          <p className="opacity-90 mb-12">
            {isLogin
              ? "Login to your account and enjoy delicious food."
              : "Create an account and start ordering tasty meals."}
          </p>

          <div className="absolute bottom-10 right-10 animate-bounce text-6xl">
            🍟
          </div>

          <div className="absolute top-10 left-10 animate-bounce text-5xl">
            🍕
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center transition-all duration-500">

          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {isLogin ? "Login" : "Register"}
          </h2>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="mb-4 px-4 py-3 rounded-xl border shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          )}

          <input
            type="text"
            placeholder="Mobile Number"
            className="mb-4 px-4 py-3 rounded-xl border shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />

          {isLogin ? (
            <input
              type="text"
              placeholder="Enter OTP"
              className="mb-6 px-4 py-3 rounded-xl border shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          ) : (
            <input
              type="password"
              placeholder="Create Password"
              className="mb-6 px-4 py-3 rounded-xl border shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          )}

          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold shadow-lg transform transition duration-300 hover:scale-110 hover:shadow-2xl">
            {isLogin ? "Login" : "Register"}
          </button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-500 cursor-pointer hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
