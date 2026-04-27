import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const [favourites, setFavourites] = useState([]);

  // 🔁 Load favourites
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favourites")) || [];
    setFavourites(saved);
  }, []);

  // 💾 Save favourites
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const openRestaurant = () => {
    navigate("/customer/restaurant", {
      state: { restaurant }
    });
  };

  const isFavourite = favourites.some((r) => r.id === restaurant.id);

  const toggleFavourite = (e) => {
    e.stopPropagation();

    setFavourites((prev) => {
      const exists = prev.find((r) => r.id === restaurant.id);

      if (exists) {
        return prev.filter((r) => r.id !== restaurant.id);
      }

      return [...prev, restaurant];
    });
  };

  return (
    <div
      onClick={openRestaurant}
      className="relative bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition duration-300 cursor-pointer group"
    >
      {/* ❤️ Favourite */}
      <button
        onClick={toggleFavourite}
        className={`absolute top-2 right-2 z-10 text-xl ${
          isFavourite ? "text-red-500" : "text-white"
        }`}
      >
        ❤️
      </button>

      {/* Image */}
      <div className="h-40 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg">
          {restaurant.name}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            restaurant.type === "Cloud Kitchen"
              ? "bg-purple-100 text-purple-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {restaurant.type}
        </span>

        <div className="mt-2 text-sm font-medium">
          ⭐ {restaurant.rating}
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;