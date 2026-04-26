import { FaCheckCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgvideo from "../assets/background_video.mp4";
const images = [
  "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
  "https://images.unsplash.com/photo-1550547660-d9450f859349",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleOrder = () => {
    if (token) {
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  const handlePlans = () => {
    if (token) {
      navigate("/register");
    } else {
      navigate("/register");
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">


      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src={bgvideo}
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/50 to-black/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 grid lg:grid-cols-2 gap-16 items-center text-white">

        {/* LEFT */}
        <div>
          <span className="inline-block bg-white/10 backdrop-blur text-orange-400 text-xs font-bold px-4 py-2 rounded-full tracking-wider">
            MODERN FOOD DELIVERY
          </span>

          <h1 className="text-5xl lg:text-6xl font-black mt-8 leading-tight">
            Fresh Meals <br />
            <span className="bg-linear-to-r from-[#ff6b35] to-orange-400 bg-clip-text text-transparent">
              Delivered Fast
            </span>
          </h1>

          <p className="mt-6 text-gray-200 text-lg max-w-lg">
            Discover curated restaurants, flexible meal subscriptions,
            and lightning-fast delivery — built for your lifestyle.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap gap-6">
            <button
              onClick={handleOrder}
              className="px-8 py-4 bg-linear-to-r from-[#ff6b35] to-orange-500 rounded-xl font-semibold shadow-xl hover:scale-105 transition duration-300"
            >
              Order Now
            </button>

            <button
              onClick={handlePlans}
              className="px-8 py-4 border border-white/30 rounded-xl backdrop-blur hover:bg-white/10 transition duration-300"
            >
              Explore Plans
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-8 text-sm mt-8 text-gray-200 items-center">
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400 text-lg" />
              30 min delivery
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400 text-lg" />
              No minimum order
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400 text-lg" />
              Live tracking
            </span>
          </div>
        </div>

        {/* RIGHT SLIDER */}
        <div className="relative hidden lg:block">
          <div className="relative w-full h-112.5 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Food"
                className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                  index === current ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}