import { CgBrowser } from "react-icons/cg";
import { FaShoppingCart } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { motion } from "framer-motion";

export default function Steps() {
  const steps = [
    {
      title: "Browse",
      desc: "Explore curated, top-rated restaurants near you.",
      icon: CgBrowser,
    },
    {
      title: "Order",
      desc: "Place your order in seconds with seamless checkout.",
      icon: FaShoppingCart,
    },
    {
      title: "Enjoy",
      desc: "Fresh, hot meals delivered to your doorstep.",
      icon: MdDeliveryDining,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative py-28 bg-gradient-to-b from-white via-orange-50 to-white overflow-hidden">

      {/* Animated Background Blobs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute -top-24 -left-24 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"
      />

      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 15 }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff6b35]/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-6 text-center">

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-5xl font-black text-gray-900 mb-6"
        >
          Hungry in 3 Simple Steps
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 mb-20 text-lg"
        >
          From craving to delivery — fast, smooth, effortless.
        </motion.p>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-12 relative"
        >
          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className="group bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-lg hover:shadow-2xl transition duration-300 border border-orange-100 relative"
              >

                {/* Connecting Line */}
                {i !== 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-1 bg-gradient-to-r from-[#ff6b35] to-orange-300 rounded-full"></div>
                )}

                {/* Icon Container */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="relative w-24 h-24 mx-auto bg-gradient-to-br from-[#ff6b35]/20 to-orange-100 rounded-3xl flex items-center justify-center"
                >
                  <Icon className="text-[#ff6b35] text-4xl" />

                  {/* Step Number */}
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-[#ff6b35] text-white text-sm rounded-full flex items-center justify-center font-bold shadow-md">
                    {i + 1}
                  </span>
                </motion.div>

                <h3 className="mt-8 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}