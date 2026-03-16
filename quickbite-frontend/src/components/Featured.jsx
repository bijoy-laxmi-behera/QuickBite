import { useEffect, useState } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL;

export default function Featured() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(`${API}/api/feedback/testimonials`);
        setFeedbacks(res.data.data);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p className="text-gray-500 animate-pulse">
          Loading the vibes ✨
        </p>
      </section>
    );
  }

  return (
    <section className="relative py-28 px-6 lg:px-20 bg-linear-to-b from-white via-orange-50 to-white overflow-hidden">

      {/* Soft Background Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff6b35]/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">

        <h2 className="text-4xl lg:text-5xl font-black text-center mb-4">
          Loved by Our Users
        </h2>

        <p className="text-center text-gray-500 mb-16 text-lg">
          Real reviews. Real food. Real satisfaction.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          {feedbacks.map((f, index) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-orange-100 hover:shadow-2xl transition duration-300"
            >
              {/* Glow Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#ff6b35]/10 to-orange-200/10 opacity-0 group-hover:opacity-100 transition"></div>

              <div className="relative z-10">

                {/* Profile */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-200"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {f.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {f.role}
                    </p>
                  </div>
                </div>

                {/* Review */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  “{f.review}”
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(f.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-[#ff6b35]">
                    {f.rating}
                  </span>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}