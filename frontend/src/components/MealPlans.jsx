import { TiTick } from "react-icons/ti";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function MealPlans() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleExplore = () => {
    if (token) {
      navigate("/register");
    } else {
      navigate("/register");
    }
  };

  return (
    <section className="py-24 px-6 lg:px-20 bg-[#f1eae6]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Student & Bachelor <br />
            <span className="bg-gradient-to-r from-[#ff6b35] to-orange-500 bg-clip-text text-transparent">
              Meal Plans
            </span>
          </h2>

          <p className="text-gray-600 mt-6 max-w-md text-lg">
            Affordable, nutritious daily meal subscriptions designed for
            students and young professionals.
          </p>

          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <TiTick className="text-green-600 text-sm" />
              </div>
              Starting at <span className="font-semibold">₹4,999/month</span>
            </li>

            <li className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <TiTick className="text-green-600 text-sm" />
              </div>
              Flexible delivery slots
            </li>

            <li className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <TiTick className="text-green-600 text-sm" />
              </div>
              Pause or modify anytime
            </li>
          </ul>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExplore}
            className="mt-10 px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition duration-300"
          >
            Explore Plans
          </motion.button>
        </div>

        {/* RIGHT GRID */}
        <div className="grid grid-cols-2 gap-6">

          {/* Column 1 */}
          <div className="space-y-6">

            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              alt="Healthy meal"
              className="w-full h-64 object-cover rounded-3xl shadow-lg"
              src="https://images.unsplash.com/photo-1550547660-d9450f859349"
            />

            <motion.div
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-3xl shadow-md border border-orange-100"
            >
              <h4 className="font-bold text-gray-900 mb-2">Weekly Lite</h4>
              <p className="text-sm text-gray-500">7 Dinners / Week</p>
              <p className="mt-3 text-lg font-semibold text-[#ff6b35]">
                ₹2,499
              </p>
            </motion.div>

          </div>

          {/* Column 2 */}
          <div className="space-y-6 mt-8">

            <motion.div
              whileHover={{ y: -6 }}
              className="bg-gradient-to-br from-[#ff6b35] to-orange-500 text-white p-8 rounded-3xl shadow-xl"
            >
              <h4 className="font-bold text-lg mb-2">Monthly Pro</h4>
              <p className="text-white/80 text-sm">
                Lunch & Dinner Daily
              </p>

              <p className="mt-6 text-3xl font-black">
                Save 30%
              </p>

              <p className="mt-2 text-lg font-semibold">
                ₹4,999 / month
              </p>
            </motion.div>

            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              alt="Poke bowl"
              className="w-full h-64 object-cover rounded-3xl shadow-lg"
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
            />

          </div>

        </div>
      </div>
    </section>
  );
}