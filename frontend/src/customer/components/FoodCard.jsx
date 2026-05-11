// src/customer/components/FoodCard.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaLeaf, FaDrumstickBite } from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import your axios config

// Dish image map — same as Restaurant.jsx for consistency
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

const fallback =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";

function FoodCard({ item, setCart, cart = [] }) {
  const [loading, setLoading] = useState(false); // ADDED: For API loading state
  const [localQty, setLocalQty] = useState(0); // ADDED: Local quantity state

  // Get current qty from cart (props)
  const cartItem = cart.find((i) => i.menuItem?._id === item._id || i.id === item.id);
  const qty = cartItem ? (cartItem.quantity || cartItem.qty) : 0;

  // ADDED: Sync local quantity with props cart
  useEffect(() => {
    setLocalQty(qty);
  }, [qty]);

  // ADDED: Add to cart API call
  const addToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/customer/me/cart/items", {
        menuItem: item._id || item.id,
        quantity: 1,
        customization: {}
      });

      if (response.data.success) {
        // Update local cart state
        setCart((prev) => {
          const exists = prev.find((i) => (i.menuItem?._id || i.id) === (item._id || item.id));
          return exists
            ? prev.map((i) => 
                (i.menuItem?._id || i.id) === (item._id || item.id) 
                  ? { ...i, quantity: (i.quantity || i.qty) + 1 }
                  : i
              )
            : [...prev, { 
                ...item, 
                menuItem: item,
                quantity: 1,
                _id: response.data.data?.items?.[response.data.data.items.length - 1]?._id 
              }];
        });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.response?.data?.message || "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Remove from cart API call
  const removeFromCart = async () => {
    setLoading(true);
    try {
      const cartItemId = cart.find((i) => (i.menuItem?._id || i.id) === (item._id || item.id))?._id;
      
      if (localQty === 1 && cartItemId) {
        // Remove item completely
        await API.delete(`/customer/me/cart/items/${cartItemId}`);
        
        setCart((prev) => prev.filter((i) => (i.menuItem?._id || i.id) !== (item._id || item.id)));
      } else if (cartItemId) {
        // Update quantity
        await API.put(`/customer/me/cart/items/${cartItemId}`, {
          quantity: localQty - 1
        });
        
        setCart((prev) =>
          prev.map((i) =>
            (i.menuItem?._id || i.id) === (item._id || item.id)
              ? { ...i, quantity: (i.quantity || i.qty) - 1 }
              : i
          )
        );
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      alert(error.response?.data?.message || "Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  const img = item.image || dishImages[item.name] || fallback;
  const isVeg = item.type === "veg" || item.isVeg === true;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col sm:flex-row group">

      {/* IMAGE */}
      <div className="relative sm:w-32 sm:shrink-0 h-36 sm:h-auto overflow-hidden">
        <img
          src={img}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* VEG/NON-VEG INDICATOR */}
        <span
          className={`absolute top-2 left-2 w-4 h-4 rounded-sm border-2 bg-white flex items-center justify-center ${isVeg ? "border-green-600" : "border-red-600"}`}
        >
          <span className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
        </span>
      </div>

      {/* INFO */}
      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-gray-800">{item.name}</h3>
              {item.category && (
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {typeof item.category === 'object' ? item.category.name : item.category}
                </span>
              )}
            </div>
            <p className="text-orange-500 font-extrabold text-sm sm:text-base shrink-0">₹{item.price}</p>
          </div>

          {/* DIET TAG */}
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${isVeg ? "text-green-600" : "text-red-500"}`}>
            {isVeg ? <FaLeaf className="text-[9px]" /> : <FaDrumstickBite className="text-[9px]" />}
            {isVeg ? "Veg" : "Non-Veg"}
          </div>
        </div>

        {/* ADD / QTY CONTROL */}
        <div className="flex justify-end mt-3">
          {loading ? (
            <div className="flex items-center gap-1.5 bg-gray-400 text-white text-xs font-bold px-4 py-2 rounded-xl">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
              ...
            </div>
          ) : localQty === 0 ? (
            <button
              onClick={addToCart}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow hover:shadow-md"
            >
              <FaPlus className="text-[10px]" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-orange-500 rounded-xl overflow-hidden shadow">
              <button 
                onClick={removeFromCart} 
                disabled={loading}
                className="text-white px-3 py-2 hover:bg-orange-600 transition disabled:opacity-50"
              >
                <FaMinus className="text-[10px]" />
              </button>
              <span className="text-white font-bold text-sm w-5 text-center">{localQty}</span>
              <button 
                onClick={addToCart} 
                disabled={loading}
                className="text-white px-3 py-2 hover:bg-orange-600 transition disabled:opacity-50"
              >
                <FaPlus className="text-[10px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodCard;