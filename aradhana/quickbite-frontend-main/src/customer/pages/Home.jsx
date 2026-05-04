// src/customer/pages/Home.jsx

import { useState } from "react";
import {
  FaSearch,
  FaHeart,
  FaUser,
  FaBell,
  FaShoppingCart,
} from "react-icons/fa";

import Recommended from "../components/Recommended";
import SubscriptionSection from "../components/SubscriptionSection";
import CategorySection from "../components/CategorySection";

const popularDishes = [
  {
    id: 1,
    name: "Butter Chicken",
    price: "₹199",
    discount: "10% OFF",
    image:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&q=80",
  },
  {
    id: 2,
    name: "Paneer Tikka",
    price: "₹179",
    discount: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80",
  },
  {
    id: 3,
    name: "Veg Biryani",
    price: "₹149",
    discount: "5% OFF",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
  },
  {
    id: 4,
    name: "Masala Dosa",
    price: "₹89",
    discount: "10% OFF",
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80",
  },
];

function Home({ setCart, setPage, setSelectedRestaurant }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedDishes, setLikedDishes] = useState([]);

  const filters = [
    "Popular",
    "Fast Delivery",
    "Tiffin",
    "Healthy",
    "Subscription",
    "Nearest",
  ];

  const toggleLike = (id) => {
    setLikedDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-8">

      {/* ─── TOP BAR ─── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* SEARCH */}
        <div className="flex items-center bg-white px-4 py-2.5 rounded-full shadow w-full sm:max-w-md">
          <FaSearch className="text-gray-400 mr-2 shrink-0" />
          <input
            placeholder='Search "paratha"'
            className="outline-none w-full text-sm bg-transparent"
          />
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-5 text-xl shrink-0 self-end sm:self-auto">
          <div className="relative cursor-pointer" onClick={() => setPage("notifications")}>
            <FaBell className="text-gray-600 hover:text-orange-500 transition" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
              2
            </span>
          </div>
          <div className="relative cursor-pointer" onClick={() => setPage("cart")}>
            <FaShoppingCart className="text-gray-600 hover:text-orange-500 transition" />
          </div>
          <FaUser
            onClick={() => setPage("profile")}
            className="text-gray-600 hover:text-orange-500 transition cursor-pointer"
          />
        </div>
      </div>

      {/* ─── HERO ─── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-400 p-5 sm:p-8 shadow-lg overflow-hidden relative">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* LEFT TEXT */}
            <div className="text-white w-full sm:w-1/2 z-10">
              <h2 className="text-base sm:text-lg font-semibold opacity-90">Hello 👋</h2>
              <p className="text-xs sm:text-sm mt-0.5 opacity-80">Healthy • Tasty • Convenient</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 leading-tight">
                Meals for Every Mood 🍽️
              </h1>
              <p className="text-xs sm:text-sm mt-1 opacity-85">
                From Home Tiffins to Restaurant Favorites
              </p>
              <button className="mt-4 bg-white text-orange-500 px-6 py-2.5 rounded-xl font-bold shadow hover:shadow-md transition text-sm sm:text-base">
                Explore Now
              </button>
            </div>

            {/* RIGHT IMAGES */}
            <div className="flex gap-2 sm:gap-3 shrink-0">
              {[
                "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80",
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
                "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=200&q=80",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="food"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md border-2 border-white/30"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">

        {/* CATEGORY */}
        <CategorySection
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* FILTER PILLS */}
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
          {filters.map((f) => (
            <div
              key={f}
              className="bg-white px-3 sm:px-4 py-2 rounded-full shadow text-xs sm:text-sm whitespace-nowrap flex items-center gap-1.5 cursor-pointer hover:bg-orange-50 hover:shadow-md transition shrink-0"
            >
              ⚡ {f}
            </div>
          ))}
        </div>

        {/* SUBSCRIPTION */}
        <SubscriptionSection setPage={setPage} />

        {/* ─── POPULAR DISHES ─── */}
        <div className="mt-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">🔥 Popular Dishes</h2>
            <span className="text-orange-500 text-xs sm:text-sm cursor-pointer font-medium hover:underline">
              See All
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {popularDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group"
              >
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-28 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-yellow-400 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    {dish.discount}
                  </span>
                  <button
                    onClick={() => toggleLike(dish.id)}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1.5 rounded-full shadow"
                  >
                    <FaHeart
                      className={`text-sm ${
                        likedDishes.includes(dish.id)
                          ? "text-red-500"
                          : "text-gray-300"
                      } transition`}
                    />
                  </button>
                </div>

                {/* INFO */}
                <div className="p-2.5 sm:p-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                    {dish.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-orange-500 font-bold text-sm sm:text-base">
                      {dish.price}
                    </p>
                    <button className="text-[10px] sm:text-xs bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600 transition font-medium">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RESTAURANTS */}
        <Recommended
          activeCategory={activeCategory}
          setCart={setCart}
          setPage={setPage}
          setSelectedRestaurant={setSelectedRestaurant}
        />
      </div>
    </div>
  );
}

export default Home;
