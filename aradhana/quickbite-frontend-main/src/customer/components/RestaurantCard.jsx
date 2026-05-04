import { useState } from "react";
import { FaStar, FaHeart, FaClock, FaMotorcycle } from "react-icons/fa";
import { MdStorefront } from "react-icons/md";

function RestaurantCard({
  restaurant,
  setPage,
  setSelectedRestaurant,
  setFavourites,
}) {
  const [liked, setLiked] = useState(false);

  const handleFav = (e) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setFavourites((prev) => {
      const exists = prev.find((r) => r.id === restaurant.id);
      return exists
        ? prev.filter((r) => r.id !== restaurant.id)
        : [...prev, restaurant];
    });
  };

  // Derive a delivery time from rating (just for display flavor)
  const deliveryTime = Math.round(20 + (5 - parseFloat(restaurant.rating)) * 6);

  return (
    <div
      onClick={() => {
        setSelectedRestaurant(restaurant);
        setPage("restaurant");
      }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
    >
      {/* ── IMAGE AREA ── */}
      <div className="relative h-40 sm:h-44 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* DARK GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* ❤️ FAV BUTTON */}
        <button
          onClick={handleFav}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            liked
              ? "bg-red-500 text-white scale-110"
              : "bg-white/90 text-gray-400 hover:text-red-400"
          }`}
        >
          <FaHeart className="text-xs" />
        </button>

        {/* TYPE BADGE */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
              restaurant.type === "Cloud Kitchen"
                ? "bg-purple-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            <MdStorefront className="text-xs" />
            {restaurant.type}
          </span>
        </div>

        {/* RATING + DELIVERY at bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-lg shadow">
            <FaStar className="text-yellow-400 text-[10px]" />
            {restaurant.rating}
          </div>
          <div className="flex items-center gap-1 bg-white/90 text-gray-700 text-[10px] font-semibold px-2 py-1 rounded-lg shadow">
            <FaClock className="text-orange-400 text-[10px]" />
            {deliveryTime} min
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="p-3">
        <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
          {restaurant.name}
        </h3>

        {/* CUISINE TAGS from items */}
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {[...new Set(restaurant.items.map((i) => i.category))].join(" • ")}
        </p>

        {/* DIVIDER */}
        <div className="border-t border-dashed border-gray-100 my-2" />

        {/* FOOTER ROW */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <FaMotorcycle className="text-orange-400 text-xs" />
            Free Delivery
          </div>
          <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
            {restaurant.items.length} Items
          </span>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
