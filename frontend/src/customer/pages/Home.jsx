import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaHeart,
  FaUser,
  FaBell,
  FaShoppingCart,
  FaSpinner,
} from "react-icons/fa";
import API from "../../services/axios";

import Recommended from "../components/Recommended";
import SubscriptionSection from "../components/SubscriptionSection";
import CategorySection from "../components/CategorySection";

// Default popular dishes (fallback if API fails)
const defaultPopularDishes = [
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

function Home({ setCart, setSelectedRestaurant, setFavourites, setPage }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedDishes, setLikedDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [popularDishes, setPopularDishes] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loadingDishes, setLoadingDishes] = useState(false);

  const filters = [
    "Popular",
    "Fast Delivery",
    "Tiffin",
    "Healthy",
    "Subscription",
    "Nearest",
  ];
  // Update your fetchPopularDishes useEffect
  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setLoadingDishes(true);
        const response = await API.get("/customer/trending-items");

        console.log("Trending items response:", response.data); // ADD THIS

        if (response.data.success && response.data.data.length > 0) {
          console.log("Found dishes:", response.data.data); // ADD THIS
          const transformedDishes = response.data.data
            .filter((item) => item._id || item.item?._id)
            .map((item) => ({
              id: item._id || item.item?._id,
              _id: item._id || item.item?._id,
              name: item.item?.name || item.name,
              price: item.item?.price || item.price,
              discount:
                item.discount || `${Math.floor(Math.random() * 20) + 5}% OFF`,
              image:
                item.item?.image ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
              originalPrice: item.item?.price,
              ordersCount: item.totalOrders,
            }));
          setPopularDishes(transformedDishes);
          console.log("Transformed dishes:", transformedDishes); // ADD THIS
        } else {
          console.log("No dishes found in response"); // ADD THIS
          setPopularDishes([]);
        }
      } catch (error) {
        console.error("Error fetching popular dishes:", error);
        setPopularDishes([]);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchPopularDishes();
  }, []);
  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await API.get("/customer/me/notifications");
        if (response.data.success) {
          const unread = response.data.data.filter((n) => !n.isRead).length;
          setNotificationCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotificationCount();

    const handleNewNotification = () => {
      setNotificationCount((prev) => prev + 1);
    };
    window.addEventListener("newNotification", handleNewNotification);

    return () =>
      window.removeEventListener("newNotification", handleNewNotification);
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await API.get("/customer/me/cart");
        if (response.data.success) {
          const items = response.data.data?.items || [];
          const totalItems = items.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          );
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await API.get(
        `/customer/restaurants/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.data.success) {
        navigate(`/customer/search?q=${searchQuery}`);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  // Handle add to cart - FIXED VERSION
  const handleAddToCart = async (dish, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // Get the menu item ID
    const menuItemId = dish._id || dish.id;

    if (!menuItemId) {
      alert("Cannot add this item. Invalid item ID.");
      return;
    }

    // Store button reference
    const btn = e.currentTarget;
    const originalText = btn ? btn.textContent : "+ Add";

    try {
      const response = await API.post("/customer/me/cart/items", {
        menuItem: menuItemId.toString(),
        quantity: 1,
        customization: {},
      });

      if (response.data.success) {
        setCartCount((prev) => prev + 1);
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        // Update button text if button still exists
        if (btn) {
          btn.textContent = "✓ Added";
          btn.classList.add("bg-green-500");

          setTimeout(() => {
            if (btn) {
              btn.textContent = originalText;
              btn.classList.remove("bg-green-500");
            }
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.response?.data?.message || "Failed to add to cart");
    }
  };
  const toggleLike = (id) =>
    setLikedDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      {/* ─── TOP BAR ─── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* SEARCH */}
        <div className="flex items-center bg-white px-4 py-2.5 rounded-full shadow w-full sm:max-w-md">
          <FaSearch className="text-gray-400 mr-2 shrink-0" />
          <input
            placeholder='Search "paratha"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="outline-none w-full text-sm bg-transparent"
          />
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-5 text-xl shrink-0 self-end sm:self-auto">
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/customer/notifications")}
          >
            <FaBell className="text-gray-600 hover:text-orange-500 transition" />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-1">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </div>
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/customer/cart")}
          >
            <FaShoppingCart className="text-gray-600 hover:text-orange-500 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-1">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <FaUser
            onClick={() => navigate("/customer/profile")}
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
              <h2 className="text-base sm:text-lg font-semibold opacity-90">
                Hello 👋
              </h2>
              <p className="text-xs sm:text-sm mt-0.5 opacity-80">
                Healthy • Tasty • Convenient
              </p>
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
          onSeeAll={() => navigate("/customer/categories")}
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              🔥 Popular Dishes
            </h2>
            <span className="text-orange-500 text-xs sm:text-sm cursor-pointer font-medium hover:underline">
              See All
            </span>
          </div>

          {loadingDishes ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {popularDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group"
                >
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
                        className={`text-sm ${likedDishes.includes(dish.id) ? "text-red-500" : "text-gray-300"} transition`}
                      />
                    </button>
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                      {dish.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-orange-500 font-bold text-sm sm:text-base">
                        {dish.price}
                      </p>
                      <button
                        onClick={(e) => handleAddToCart(dish, e)}
                        className="text-[10px] sm:text-xs bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600 transition font-medium"
                      >
                        + Add
                      </button>
                    </div>
                    {dish.ordersCount && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        ⭐ {dish.ordersCount}+ orders
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Recommended
          activeCategory={activeCategory}
          setCart={setCart}
          setSelectedRestaurant={setSelectedRestaurant}
          setFavourites={setFavourites}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

export default Home;
