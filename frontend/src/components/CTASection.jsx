import { motion } from "framer-motion";
import { Store, Handshake, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-32 px-6 lg:px-20 bg-[#f6f2ef] overflow-hidden">

      {/* Animated Background Glow */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute -top-24 -left-24 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 14 }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff6b35]/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12">

        {/* LEFT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          whileHover={{ y: -10 }}
          className="group relative rounded-3xl p-[2px] bg-gradient-to-br from-[#ff6b35] to-orange-500 shadow-2xl"
        >
          <div className="bg-gradient-to-br from-[#ff6b35] to-orange-500 text-white rounded-3xl p-14 relative overflow-hidden">

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Hungry right now?
                <br />
                Subscribe & Save Big.
              </h2>

              <p className="text-white/80 mb-8 max-w-md">
                Exclusive student deals, faster delivery and priority support.
              </p>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-white text-[#ff6b35] px-8 py-4 rounded-xl font-semibold shadow-lg transition"
              >
                <Store size={18} />
                Get the App
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          whileHover={{ y: -10 }}
          className="group relative bg-white rounded-3xl p-14 shadow-2xl border border-orange-100 overflow-hidden"
        >
          {/* Gradient Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/5 to-orange-200/10 opacity-0 group-hover:opacity-100 transition"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-6 leading-tight text-gray-900">
              Grow your business with{" "}
              <span className="bg-gradient-to-r from-[#ff6b35] to-orange-500 bg-clip-text text-transparent">
                QuickBite
              </span>
            </h2>

            <p className="text-gray-600 mb-8 max-w-md">
              Reach more customers, boost revenue, and streamline operations.
            </p>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-gradient-to-r from-[#ff6b35] to-orange-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition"
            >
              <Handshake size={18} />
              Become a Partner
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}