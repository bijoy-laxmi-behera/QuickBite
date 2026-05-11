// src/customer/pages/Categories.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUtensils, FaSearch, FaSpinner } from "react-icons/fa";
import API from "../../services/axios";

// Category images
import all from "../../assets/categories/all.png";
import pizza from "../../assets/categories/pizza.png";
import biryani from "../../assets/categories/biryani.png";
import burger from "../../assets/categories/burger.png";
import cake from "../../assets/categories/cake.png";
import chicken from "../../assets/categories/chicken.png";
import coffee from "../../assets/categories/coffee.png";
import dessert from "../../assets/categories/dessert.png";
import dosa from "../../assets/categories/dosa.png";
import egg from "../../assets/categories/egg.png";
import fish from "../../assets/categories/fish.png";
import fried from "../../assets/categories/friedrice.png";
import greensalad from "../../assets/categories/greensalad.png";
import juice from "../../assets/categories/juice.png";
import mealbox from "../../assets/categories/mealbox.png";
import noodles from "../../assets/categories/noodles.png";
import paneer from "../../assets/categories/paneer.png";
import pasta from "../../assets/categories/pasta.png";
import roti from "../../assets/categories/roti.png";
import tiffin from "../../assets/categories/tiffin.png";

const categoryImages = {
  "All": all,
  "Pizza": pizza,
  "Biryani": biryani,
  "Burger": burger,
  "Cake": cake,
  "Chicken": chicken,
  "Coffee": coffee,
  "Dessert": dessert,
  "Dosa": dosa,
  "Egg": egg,
  "Fish": fish,
  "Fried Rice": fried,
  "Healthy": greensalad,
  "Juice": juice,
  "Meal Box": mealbox,
  "Noodles": noodles,
  "Paneer": paneer,
  "Pasta": pasta,
  "Roti": roti,
  "Tiffin": tiffin,
};

const categoriesList = [
  "All", "Pizza", "Biryani", "Burger", "Cake", "Chicken", "Coffee",
  "Dessert", "Dosa", "Egg", "Fish", "Fried Rice", "Healthy", "Juice",
  "Meal Box", "Noodles", "Paneer", "Pasta", "Roti", "Tiffin"
];

function Categories() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode

  // Fetch restaurants when category changes (only when not searching)
  useEffect(() => {
    if (!isSearchMode) {
      fetchRestaurantsByCategory();
    }
  }, [selectedCategory]);

  // Handle search when user types
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // If search is empty, exit search mode and show category restaurants
      setIsSearchMode(false);
      fetchRestaurantsByCategory();
      return;
    }

    setIsSearchMode(true);
    setSearching(true);
    
    try {
      // Search restaurants by name or cuisine
      const response = await API.get(`/customer/restaurants/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data.success) {
        let results = response.data.data;
        
        // Filter by selected category if not "All"
        if (selectedCategory !== "All") {
          results = results.filter(restaurant => {
            const cuisineStr = restaurant.cuisine ? String(restaurant.cuisine).toLowerCase() : "";
            return cuisineStr.includes(selectedCategory.toLowerCase());
          });
        }
        setRestaurants(results);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Error searching restaurants:", error);
      setRestaurants([]);
    } finally {
      setSearching(false);
    }
  };

  const fetchRestaurantsByCategory = async () => {
    try {
      setLoading(true);
      let url = "/customer/restaurants";
      if (selectedCategory !== "All") {
        url += `?cuisine=${encodeURIComponent(selectedCategory)}`;
      }
      const response = await API.get(url);
      if (response.data.success) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSearchTerm(""); // Clear search input
    setIsSearchMode(false); // Exit search mode
  };

  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm !== undefined) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const getCuisineString = (cuisine) => {
    if (!cuisine) return "Multi-Cuisine";
    if (typeof cuisine === 'string') return cuisine;
    if (Array.isArray(cuisine)) return cuisine.join(", ");
    return "Multi-Cuisine";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Explore Categories
          </h1>
          <p className="text-gray-500">
            Discover restaurants by your favorite cuisine
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search in ${selectedCategory === "All" ? "all categories" : selectedCategory}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none transition"
            />
            {(searching || loading) && (
              <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 animate-spin" />
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {categoriesList.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCategoryClick(category)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                selectedCategory === category && !isSearchMode
                  ? "bg-gradient-to-br from-orange-500 to-yellow-400 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:shadow-md border border-gray-100"
              }`}
            >
              <img
                src={categoryImages[category]}
                alt={category}
                className="w-12 h-12 object-contain mb-2"
              />
              <span className="text-sm font-semibold">{category}</span>
            </motion.button>
          ))}
        </div>

        {/* Results Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isSearchMode ? `Search Results for "${searchTerm}"` : 
                (selectedCategory === "All" ? "All Restaurants" : `${selectedCategory} Restaurants`)}
            </h2>
            <span className="text-sm text-gray-500">
              {restaurants.length} restaurants found
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaUtensils className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No restaurants found</p>
              <p className="text-sm text-gray-300 mt-1">
                {isSearchMode ? `No results found for "${searchTerm}"` : "Try a different category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => window.location.href = `/customer/restaurant/${restaurant._id}`}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={restaurant.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-bold text-sm truncate">{restaurant.name}</h3>
                      <p className="text-white/80 text-xs">{getCuisineString(restaurant.cuisine)}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-semibold">{restaurant.rating || "4.5"}</span>
                        <span className="text-xs text-gray-400">({restaurant.ratingCount || 100})</span>
                      </div>
                      <span className="text-xs text-gray-400">{restaurant.deliveryTime || "30-40"} min</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {restaurant.address?.city || "Multiple locations"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;