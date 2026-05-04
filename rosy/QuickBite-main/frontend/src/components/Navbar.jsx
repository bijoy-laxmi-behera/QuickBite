import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkStyle =
    "relative text-sm font-medium text-gray-700 hover:text-[#ff6b35] transition duration-300 after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-[#ff6b35] after:transition-all after:duration-300 hover:after:w-full";

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3 group transition duration-300 hover:scale-[1.02]"
        >
          <img
            src={logo}
            alt="QuickBite Logo"
            className="h-14 w-auto object-contain"
          />

          <span className="text-3xl lg:text-4xl font-black tracking-tight leading-none">
            Quick
            <span className="bg-gradient-to-r from-[#ff6b35] to-orange-500 bg-clip-text text-transparent">
              Bite
            </span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#how-it-works" className={navLinkStyle}>
            How it Works
          </a>
          <a href="#featured" className={navLinkStyle}>
            Browse Restaurants
          </a>
          <a href="#partners" className={navLinkStyle}>
            For Partners
          </a>
        </div>

        {/* AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink
            to="/login"
            className="px-5 py-2 rounded-lg border border-[#ff6b35] text-[#ff6b35] font-medium hover:bg-[#ff6b35] hover:text-white transition duration-300"
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="px-5 py-2 rounded-lg bg-linear-to-r from-[#ff6b35] to-orange-500 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.03] transition duration-300"
          >
            Sign Up
          </NavLink>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-lg">
          <a
            href="#how-it-works"
            className="block text-gray-700 hover:text-[#ff6b35]"
            onClick={() => setIsOpen(false)}
          >
            How it Works
          </a>
          <a
            href="#featured"
            className="block text-gray-700 hover:text-[#ff6b35]"
            onClick={() => setIsOpen(false)}
          >
            Browse Restaurants
          </a>
          <a
            href="#partners"
            className="block text-gray-700 hover:text-[#ff6b35]"
            onClick={() => setIsOpen(false)}
          >
            For Partners
          </a>

          <div className="pt-3 border-t border-gray-200 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="border border-[#ff6b35] text-[#ff6b35] px-4 py-2 rounded-md text-center font-medium hover:bg-[#ff6b35] hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="bg-linear-to-r from-[#ff6b35] to-orange-500 text-white px-4 py-2 rounded-md text-center font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}