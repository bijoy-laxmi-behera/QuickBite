// src/customer/components/Recommended.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantCard from "./RestaurantCard";
import API from "../../services/axios";

import spiceKitchen from "../../assets/restaurants/spice-kitchen1.jpg";
import biryaniHub from "../../assets/restaurants/biryanihub1.jpg";
import chineseWok from "../../assets/restaurants/chinese-wok.jpg";
import dailyTiffin from "../../assets/restaurants/daily-tiffin.jpg";
import greenBowl from "../../assets/restaurants/green-bowl1.jpg";
import pizzaTown from "../../assets/restaurants/pizzatown1.jpg";

const fallbackImages = {
  "Spice Kitchen": spiceKitchen,
  "Biryani Hub": biryaniHub,
  "Pizza Town": pizzaTown,
  "Green Bowl": greenBowl,
  "Daily Tiffin": dailyTiffin,
  "Chinese Wok": chineseWok,
};

const defaultFallback =
  "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80";

const getRestaurantImage = (name) => fallbackImages[name] || defaultFallback;

function Recommended({
  activeCategory,
  setPage,
  setSelectedRestaurant,
  setFavourites,
}) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Always fetch ALL restaurants — filter on frontend
        // Backend cuisine filter doesn't work when vendor cuisine is empty
        const response = await API.get("/customer/restaurants");
        console.log("API Response:", response.data);

        if (response.data.success) {
          const transformed = response.data.data.map((r) => ({
            id: r._id,
            _id: r._id,
            name: r.name,
            type: r.type || "Restaurant",
            rating: r.rating || "4.0",
            image: r.image || r.logo || getRestaurantImage(r.name),
            // ✅ normalize cuisine to always be a string for easy filtering
            cuisine: Array.isArray(r.cuisine)
              ? r.cuisine.join(", ")
              : r.cuisine || "",
            address: r.address || {},
            deliveryTime: r.deliveryTime || 30,
            minOrder: r.minOrder || 100,
            isOpen: r.isOpen ?? true,
            items: r.menuItems || [],
          }));
          setRestaurants(transformed);
        } else {
          setError("Failed to load restaurants");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []); // ✅ fetch once — filtering is done below on frontend

  // ✅ FIXED filter logic — show restaurant if:
  // 1. activeCategory is "All"
  // 2. cuisine is empty/missing (vendor hasn't set it yet)
  // 3. cuisine matches the selected category
  const filteredData = restaurants.filter((res) => {
    if (activeCategory === "All") return true;
    if (!res.cuisine || res.cuisine.length === 0) return true; // ✅ show if no cuisine set
    return res.cuisine.toLowerCase().includes(activeCategory.toLowerCase());
  });

  if (loading)
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            🍴 Restaurants For You
          </h2>
          <span className="text-orange-500 text-xs sm:text-sm font-medium">
            See All
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          🍴 Restaurants For You
        </h2>
        <span
          onClick={() => navigate("/customer/restaurants")}
          className="text-orange-500 text-xs sm:text-sm font-medium cursor-pointer hover:underline"
        >
          See All
        </span>
      </div>

      {error ? (
        <div className="text-center py-12 text-red-400">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-orange-500 underline"
          >
            Try Again
          </button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-semibold">
            No restaurants found for this category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredData.map((res) => (
            <RestaurantCard
              key={res._id}
              restaurant={res}
              setPage={setPage}
              setSelectedRestaurant={setSelectedRestaurant}
              setFavourites={setFavourites}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Recommended;
