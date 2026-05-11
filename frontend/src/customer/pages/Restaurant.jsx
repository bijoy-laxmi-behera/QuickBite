// src/customer/pages/Restaurant.jsx
import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaStar,
  FaHeart,
  FaSearch,
  FaPlus,
  FaMinus,
  FaClock,
  FaMotorcycle,
  FaLeaf,
  FaDrumstickBite,
  FaSpinner,
} from "react-icons/fa";
import { MdStorefront } from "react-icons/md";
import API from "../../services/axios";

// ─── Dish image map (Unsplash, keyed by item name) ───────────────────────────
const dishImages = {
  "Paneer Butter Masala":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
  "Dal Makhani":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  "Paneer Tikka":
    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=400&q=80",
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80",
  "Mutton Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
  "Chicken Starter":
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80",
  Margherita:
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80",
  "Farmhouse Pizza":
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "Garlic Bread":
    "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80",
  "Veg Bowl":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "Salad Mix":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
  "Home Thali":
    "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80",
  "Mini Meal":
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80",
  "Hakka Noodles":
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
  Manchurian:
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

// ─── Dish Card ────────────────────────────────────────────────────────────────
function DishCard({ item, qty, onAdd, onRemove, loading }) {
  const img = dishImages[item.name] || item.image || fallbackImage;
  const isVeg = item.type === "veg" || item.isVeg === true;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col sm:flex-row">
      <div className="relative sm:w-36 sm:shrink-0 h-40 sm:h-auto overflow-hidden">
        <img src={img} alt={item.name} className="w-full h-full object-cover" />
        <span className={`absolute top-2 left-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
          isVeg ? "border-green-600 bg-white" : "border-red-600 bg-white"
        }`}>
          <span className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
        </span>
      </div>
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-gray-800">{item.name}</h4>
              <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5 block">
                {typeof item.category === 'object' ? item.category.name : item.category}
              </span>
            </div>
            <p className="text-orange-500 font-extrabold text-sm sm:text-base whitespace-nowrap">₹{item.price}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
            {item.description || "Fresh, made-to-order with premium ingredients."}
          </p>
        </div>
        <div className="mt-3 flex justify-end">
          {loading ? (
            <div className="flex items-center gap-1.5 bg-gray-400 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl">
              <FaSpinner className="animate-spin" />
            </div>
          ) : qty === 0 ? (
            <button onClick={onAdd} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition shadow-md hover:shadow-lg">
              <FaPlus className="text-[10px]" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 rounded-xl overflow-hidden shadow-md">
              <button onClick={onRemove} className="text-white px-3 py-2 hover:bg-orange-600 transition">
                <FaMinus className="text-[10px]" />
              </button>
              <span className="text-white font-bold text-sm w-5 text-center">{qty}</span>
              <button onClick={onAdd} className="text-white px-3 py-2 hover:bg-orange-600 transition">
                <FaPlus className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Restaurant Page ─────────────────────────────────────────────────────
function Restaurant({ restaurant: propRestaurant, setCart, cart, setPage, setFavourites }) {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(propRestaurant || null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [dietFilter, setDietFilter] = useState("all");
  const [liked, setLiked] = useState(false);
  const [addingItem, setAddingItem] = useState(null);
  const [error, setError] = useState(null);

  // Fetch restaurant and menu data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      // If restaurant is passed as prop, use it
      if (propRestaurant && propRestaurant._id) {
        setRestaurant(propRestaurant);
        fetchMenu(propRestaurant._id);
        return;
      }

      // Otherwise fetch by ID from URL
      if (restaurantId) {
        try {
          setLoading(true);
          setError(null);
          
          // Fetch restaurant details
          const restaurantRes = await API.get(`/customer/restaurants/${restaurantId}`);
          if (restaurantRes.data.success) {
            setRestaurant(restaurantRes.data.data);
            fetchMenu(restaurantId);
          } else {
            setError("Restaurant not found");
          }
        } catch (error) {
          console.error("Error fetching restaurant:", error);
          setError("Failed to load restaurant. Please try again.");
        }
      } else {
        setLoading(false);
        setError("No restaurant selected");
      }
    };

    const fetchMenu = async (id) => {
      try {
        const response = await API.get(`/customer/restaurants/${id}/menu`);
        if (response.data.success) {
          const groupedData = response.data.data;
          const flatItems = [];
          
          Object.keys(groupedData).forEach(category => {
            groupedData[category].forEach(item => {
              flatItems.push({
                id: item._id,
                _id: item._id,
                name: item.name,
                price: item.price,
                category: category,
                type: item.isVeg ? "veg" : "non-veg",
                image: item.image,
                description: item.description,
                isAvailable: item.isAvailable !== false
              });
            });
          });
          setMenuItems(flatItems);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId, propRestaurant]);

  // Check if restaurant is in favourites
  useEffect(() => {
    const checkFavourite = async () => {
      if (!restaurant?._id) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await API.get("/customer/me/favourites");
        if (response.data.success) {
          const isFav = response.data.data.some(fav => fav._id === restaurant._id);
          setLiked(isFav);
        }
      } catch (error) {
        console.error("Error checking favourite:", error);
      }
    };

    checkFavourite();
  }, [restaurant]);

  // Add to cart
  const addToCart = async (item) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAddingItem(item.id);
    try {
      await API.post("/customer/me/cart/items", {
        menuItem: item._id,
        quantity: 1,
        customization: {}
      });

      setCart((prev) => {
        const exists = prev.find((c) => (c.menuItem?._id || c.id) === item.id);
        return exists
          ? prev.map((c) => (c.id === item.id || c.menuItem?._id === item.id) 
              ? { ...c, quantity: (c.quantity || c.qty) + 1 }
              : c)
          : [...prev, { ...item, id: item.id, quantity: 1, qty: 1 }];
      });

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingItem(null);
    }
  };

  // Remove from cart
  const removeFromCart = async (item) => {
    const cartItem = cart.find(c => (c.menuItem?._id || c.id) === item.id);
    const cartItemId = cartItem?._id || cartItem?.cartItemId;

    setAddingItem(item.id);
    try {
      if (cartItem && (cartItem.quantity || cartItem.qty) === 1 && cartItemId) {
        await API.delete(`/customer/me/cart/items/${cartItemId}`);
      } else if (cartItemId) {
        await API.put(`/customer/me/cart/items/${cartItemId}`, {
          quantity: (cartItem.quantity || cartItem.qty) - 1
        });
      }

      setCart((prev) => {
        const exists = prev.find((c) => (c.menuItem?._id || c.id) === item.id);
        if (!exists) return prev;
        if ((exists.quantity || exists.qty) === 1) {
          return prev.filter((c) => (c.menuItem?._id || c.id) !== item.id);
        }
        return prev.map((c) => (c.id === item.id || c.menuItem?._id === item.id)
          ? { ...c, quantity: (c.quantity || c.qty) - 1, qty: (c.qty || c.quantity) - 1 }
          : c);
      });

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error("Remove from cart error:", error);
    } finally {
      setAddingItem(null);
    }
  };

  // Handle favourite toggle
  const handleFavourite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add to favourites");
      navigate("/login");
      return;
    }

    try {
      if (liked) {
        await API.delete(`/customer/me/favourites/${restaurant._id}`);
        setLiked(false);
        if (setFavourites) {
          setFavourites((prev) => prev.filter((r) => (r._id || r.id) !== restaurant._id));
        }
      } else {
        await API.post("/customer/me/favourites", {
          itemId: restaurant._id,
          itemType: "restaurant"
        });
        setLiked(true);
        if (setFavourites) {
          setFavourites((prev) => [...prev, restaurant]);
        }
      }
    } catch (error) {
      console.error("Favourite error:", error);
      alert(error.response?.data?.message || "Failed to update favourites");
    }
  };

  // Handle go back
  const handleGoBack = () => {
    if (setPage) {
      setPage("home");
    } else {
      navigate("/customer/home");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-orange-500 text-4xl mb-4" />
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 text-lg mb-4">{error || "Restaurant not found"}</p>
        <button
          onClick={handleGoBack}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // All unique categories
  const categories = ["All", ...new Set(menuItems.map((i) => i.category))];

  // Filtered items
  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeFilter === "All" || item.category === activeFilter;
      const matchDiet = dietFilter === "all" || item.type === dietFilter;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchDiet && matchSearch && item.isAvailable !== false;
    });
  }, [menuItems, activeFilter, dietFilter, search]);

  // Cart helpers
  const getQty = (itemId) => {
    const found = cart.find((c) => (c.menuItem?._id || c.id) === itemId);
    return found ? (found.quantity || found.qty || 0) : 0;
  };

  const totalCartItems = cart.reduce((sum, c) => sum + (c.quantity || c.qty || 0), 0);
  const totalCartValue = cart.reduce((sum, c) => sum + (c.price || 0) * (c.quantity || c.qty || 0), 0);
  const deliveryTime = restaurant.deliveryTime || Math.round(20 + (5 - parseFloat(restaurant.rating || 4)) * 6);

  return (
    <div className="bg-gray-50 min-h-screen pb-28">

      {/* HERO BANNER */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={restaurant.image || restaurant.logo || fallbackImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* BACK BUTTON */}
        <button
          onClick={handleGoBack}
          className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur text-white rounded-full flex items-center justify-center hover:bg-white/40 transition"
        >
          <FaArrowLeft />
        </button>

        {/* FAV BUTTON */}
        <button
          onClick={handleFavourite}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition ${
            liked ? "bg-red-500 text-white" : "bg-white/20 backdrop-blur text-white hover:bg-white/40"
          }`}
        >
          <FaHeart />
        </button>

        {/* RESTAURANT INFO OVERLAY */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              restaurant.type === "Cloud Kitchen" ? "bg-purple-600" : "bg-green-600"
            }`}>
              <MdStorefront className="text-xs" />
              {restaurant.type || "Restaurant"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1 text-sm">
            <span className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-xs" />
              <span className="font-bold">{restaurant.rating || "4.5"}</span>
              <span className="text-white/70 text-xs">(200+ ratings)</span>
            </span>
            <span className="flex items-center gap-1 text-white/80">
              <FaClock className="text-xs" /> {deliveryTime} min
            </span>
            <span className="flex items-center gap-1 text-white/80">
              <FaMotorcycle className="text-xs" /> Free Delivery
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-3xl mx-auto px-4 -mt-5 relative z-10">
        <div className="flex items-center bg-white rounded-2xl shadow-lg px-4 py-3 gap-2 border border-gray-100">
          <FaSearch className="text-gray-400 shrink-0" />
          <input
            placeholder={`Search in ${restaurant.name}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm w-full bg-transparent text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-400 text-xs hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      {/* FILTERS AREA */}
      <div className="max-w-3xl mx-auto px-4 mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setDietFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            dietFilter === "all" ? "bg-gray-800 text-white" : "bg-white text-gray-500 border border-gray-200"
          }`}>All</button>
          <button onClick={() => setDietFilter("veg")} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            dietFilter === "veg" ? "bg-green-600 text-white" : "bg-white text-green-600 border border-green-200"
          }`}>
            <FaLeaf className="text-[10px]" /> Veg Only
          </button>
          <button onClick={() => setDietFilter("non-veg")} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            dietFilter === "non-veg" ? "bg-red-600 text-white" : "bg-white text-red-500 border border-red-200"
          }`}>
            <FaDrumstickBite className="text-[10px]" /> Non-Veg
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition shrink-0 ${
              activeFilter === cat ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS COUNT */}
      <div className="max-w-3xl mx-auto px-4 mt-4">
        <p className="text-xs text-gray-400 font-medium">
          Showing {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          {activeFilter !== "All" ? ` in ${activeFilter}` : ""}
        </p>
      </div>

      {/* DISH GRID */}
      <div className="max-w-3xl mx-auto px-4 mt-3 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <DishCard
              key={item.id || item._id}
              item={item}
              qty={getQty(item.id || item._id)}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item)}
              loading={addingItem === (item.id || item._id)}
            />
          ))
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-semibold text-gray-500">No dishes found</p>
            <p className="text-xs mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>

      {/* STICKY CART BAR */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:left-64">
          <button
            onClick={() => setPage ? setPage("cart") : navigate("/customer/cart")}
            className="w-full max-w-3xl mx-auto flex items-center justify-between bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-2xl px-5 py-4 shadow-2xl hover:from-orange-600 hover:to-yellow-500 transition"
          >
            <div className="flex items-center gap-3">
              <span className="bg-white/30 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {totalCartItems}
              </span>
              <span className="font-bold text-sm sm:text-base">
                {totalCartItems} item{totalCartItems > 1 ? "s" : ""} added
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <span>₹{totalCartValue}</span>
              <span>→ View Cart</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default Restaurant;