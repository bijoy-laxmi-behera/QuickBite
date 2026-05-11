import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Twitter,
  Share2,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  const footerLinks = {
    Company: ["About Us", "Careers", "Press", "Blog"],
    Support: ["Help Center", "Safety", "Contact Us", "Refund Policy"],
    "Partner With Us": [
      "Restaurants",
      "Couriers",
      "Merchant Help",
      "Enterprise",
    ],
  };

  const socialIcons = [
    { icon: <Facebook size={18} />, label: "Facebook" },
    { icon: <Instagram size={18} />, label: "Instagram" },
    { icon: <Twitter size={18} />, label: "Twitter" },
    { icon: <Share2 size={18} />, label: "Share" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-white to-orange-50 border-t border-orange-100 pt-24 pb-12 px-6 lg:px-20 overflow-hidden">

      {/* Soft glow background */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#ff6b35]/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-14 mb-20">

          {/* BRAND */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-[#ff6b35] to-orange-500 text-white p-3 rounded-xl shadow-md">
                🍔
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-[#ff6b35] to-orange-500 bg-clip-text text-transparent">
                  QuickBite
                </span>
              </h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
              Connecting you to the best flavors in town.
              Fast, reliable, always fresh.
              Your next meal is just a tap away.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-4">
              {socialIcons.map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.label}
                  className="w-11 h-11 rounded-full bg-white shadow-md border border-orange-100 text-[#ff6b35] flex items-center justify-center hover:bg-gradient-to-br hover:from-[#ff6b35] hover:to-orange-500 hover:text-white transition duration-300"
                >
                  {item.icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* LINKS */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-6 text-gray-900 tracking-wide">
                {title}
              </h4>
              <ul className="space-y-4 text-sm text-gray-600">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="relative hover:text-[#ff6b35] transition group"
                    >
                      {link}
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[#ff6b35] transition-all group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-orange-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">

          <p>© {year} QuickBite Inc. All rights reserved.</p>

          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-[#ff6b35] transition"
                >
                  {item}
                </a>
              )
            )}
          </div>

        </div>

      </div>
    </footer>
  );
}