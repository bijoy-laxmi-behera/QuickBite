import { useState, useEffect } from "react";
import { FaStar, FaHeart, FaClock, FaMotorcycle } from "react-icons/fa";
import { MdStorefront } from "react-icons/md";
import API from "../../services/axios"; // ADDED: Import axios config

function RestaurantCard({
  restaurant,
  setPage,
  setSelectedRestaurant,
  setFavourites,
}) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false); // ADDED: For favourite action loading

  // ADDED: Check if restaurant is already in favourites on mount
  useEffect(() => {
    const checkFavouriteStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await API.get("/customer/me/favourites");
        if (response.data.success) {
          const favourites = response.data.data || [];
          const isFav = favourites.some(fav => 
            fav._id === restaurant._id || fav === restaurant._id
          );
          setLiked(isFav);
        }
      } catch (error) {
        console.error("Error checking favourites:", error);
      }
    };

    checkFavouriteStatus();
  }, [restaurant._id]);
// RestaurantCard.jsx - Updated handleFav function
const handleFav = async (e) => {
  e.stopPropagation();
  
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to add favourites");
    window.location.href = "/login";
    return;
  }

  setLoading(true);
  
  try {
    if (liked) {
      // Remove from favourites
      await API.delete(`/customer/me/favourites/${restaurant._id}`);
      setLiked(false);
      if (setFavourites && typeof setFavourites === 'function') {
        setFavourites((prev) => prev.filter((r) => (r._id || r.id) !== (restaurant._id || restaurant.id)));
      }
      alert("Removed from favourites");
    } else {
      // Add to favourites
      const response = await API.post("/customer/me/favourites", {
        itemId: restaurant._id,
        itemType: "restaurant"
      });
      
      console.log("Add to favourites response:", response.data); // Debug log
      
      if (response.data.success) {
        setLiked(true);
        if (setFavourites && typeof setFavourites === 'function') {
          setFavourites((prev) => [...prev, restaurant]);
        }
        alert("Added to favourites! ❤️");
      }
    }
  } catch (error) {
    console.error("Favourite error:", error);
    console.error("Error details:", error.response?.data);
    alert(error.response?.data?.message || "Failed to update favourites");
  } finally {
    setLoading(false);
  }
};
  // Derive a delivery time from rating or use backend value
  const deliveryTime = restaurant.deliveryTime || Math.round(20 + (5 - parseFloat(restaurant.rating || 4)) * 6);
  
  // Get unique cuisine/categories from restaurant data
  const getCuisineTags = () => {
    if (restaurant.cuisine) {
      return restaurant.cuisine;
    }
    if (restaurant.items && restaurant.items.length > 0) {
      return [...new Set(restaurant.items.map((i) => i.category?.name || i.category))].join(" • ");
    }
    return restaurant.type || "Multi-Cuisine";
  };

  // Get item count
  const getItemCount = () => {
    if (restaurant.items) return restaurant.items.length;
    if (restaurant.menuCount) return restaurant.menuCount;
    return 0;
  };

  // Get rating display
  const getRating = () => {
    if (restaurant.rating) {
      return typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : restaurant.rating;
    }
    return "4.0";
  };

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
          src={restaurant.image || restaurant.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* DARK GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* ❤️ FAV BUTTON */}
        <button
          onClick={handleFav}
          disabled={loading}
          className={`absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            liked
              ? "bg-red-500 text-white scale-110"
              : "bg-white/90 text-gray-400 hover:text-red-400"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <FaHeart className="text-xs" />
        </button>

        {/* TYPE BADGE */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
              restaurant.type === "Cloud Kitchen"
                ? "bg-purple-600 text-white"
                : restaurant.type === "Restaurant"
                ? "bg-green-600 text-white"
                : "bg-orange-600 text-white"
            }`}
          >
            <MdStorefront className="text-xs" />
            {restaurant.type || (restaurant.isCloudKitchen ? "Cloud Kitchen" : "Restaurant")}
          </span>
        </div>

        {/* RATING + DELIVERY at bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-lg shadow">
            <FaStar className="text-yellow-400 text-[10px]" />
            {getRating()}
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
          {getCuisineTags()}
        </p>

        {/* DIVIDER */}
        <div className="border-t border-dashed border-gray-100 my-2" />

        {/* FOOTER ROW */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <FaMotorcycle className="text-orange-400 text-xs" />
            {restaurant.deliveryFee === 0 ? "Free Delivery" : (restaurant.deliveryFee ? `₹${restaurant.deliveryFee} Delivery` : "Free Delivery")}
          </div>
          <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
            {getItemCount()} Items
          </span>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;