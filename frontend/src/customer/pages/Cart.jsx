import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaMinus, FaTag, FaShoppingBag, FaArrowRight, FaSpinner } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import API from "../../services/axios"; // ADDED: Import axios config
import { triggerCartUpdate } from "../../services/helpers"; // ADDED: Helper to notify sidebar

function Cart({ cart, setCart, setPage }) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false); // ADDED: Loading state
  const [appliedCouponCode, setAppliedCouponCode] = useState(""); // ADDED: Store applied coupon

  // ADDED: Fetch cart from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await API.get("/customer/me/cart");
        if (response.data.success) {
          const cartItems = response.data.data.items || [];
          // Transform backend cart to component format
          const transformedCart = cartItems.map(item => ({
            id: item.menuItem?._id || item._id,
            _id: item.menuItem?._id || item._id,
            name: item.menuItem?.name,
            price: item.menuItem?.price,
            qty: item.quantity,
            type: item.menuItem?.isVeg ? "veg" : "non-veg",
            image: item.menuItem?.image,
            cartItemId: item._id // Store cart item ID for updates
          }));
          setCart(transformedCart);
          
          // Load applied coupon if any
          if (response.data.data.coupon) {
            setAppliedCouponCode(response.data.data.coupon);
            setCouponApplied(true);
            setCoupon(response.data.data.coupon);
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [setCart]);

  // ADDED: Update cart item quantity in backend
  const updateQuantity = async (item, newQty) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (newQty > item.qty) {
        // Add to cart
        await API.post("/customer/me/cart/items", {
          menuItem: item.id,
          quantity: 1,
          customization: {}
        });
      } else {
        // Remove or decrease
        if (newQty === 0) {
          await API.delete(`/customer/me/cart/items/${item.cartItemId}`);
        } else {
          await API.put(`/customer/me/cart/items/${item.cartItemId}`, {
            quantity: newQty
          });
        }
      }
      
      // Notify sidebar to update cart count
      triggerCartUpdate();
    } catch (error) {
      console.error("Error updating cart:", error);
      alert(error.response?.data?.message || "Failed to update cart");
    }
  };

  // ADDED: Apply coupon via backend
  const applyCoupon = async () => {
    if (!coupon.trim()) {
      setCouponMsg("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/customer/me/cart/apply-coupon", {
        code: coupon
      });

      if (response.data.success) {
        setDiscount(response.data.data.discount);
        setCouponApplied(true);
        setAppliedCouponCode(coupon);
        setCouponMsg(`Coupon applied! ${response.data.data.discount}% off 🎉`);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setDiscount(0);
      setCouponApplied(false);
      setCouponMsg(error.response?.data?.message || "Invalid coupon code ❌");
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Remove coupon
  const removeCoupon = async () => {
    setLoading(true);
    try {
      // You can add an API endpoint to remove coupon if needed
      setDiscount(0);
      setCouponApplied(false);
      setAppliedCouponCode("");
      setCoupon("");
      setCouponMsg("");
    } catch (error) {
      console.error("Error removing coupon:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Increase quantity
  const increase = async (item) => {
    const newQty = item.qty + 1;
    setCart((prev) => prev.map((i) => i.id === item.id ? { ...i, qty: newQty } : i));
    await updateQuantity(item, newQty);
  };

  // UPDATED: Decrease quantity
  const decrease = async (item) => {
    if (item.qty === 1) {
      await removeItem(item.id);
    } else {
      const newQty = item.qty - 1;
      setCart((prev) => prev.map((i) => i.id === item.id ? { ...i, qty: newQty } : i));
      await updateQuantity(item, newQty);
    }
  };

  // UPDATED: Remove item
  const removeItem = async (id) => {
    const item = cart.find(i => i.id === id);
    if (item?.cartItemId) {
      try {
        await API.delete(`/customer/me/cart/items/${item.cartItemId}`);
        setCart((prev) => prev.filter((i) => i.id !== id));
        triggerCartUpdate();
      } catch (error) {
        console.error("Error removing item:", error);
        alert(error.response?.data?.message || "Failed to remove item");
      }
    } else {
      setCart((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // UPDATED: Clear cart
  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      await API.delete("/customer/me/cart");
      setCart([]);
      setDiscount(0);
      setCoupon("");
      setCouponApplied(false);
      setCouponMsg("");
      triggerCartUpdate();
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert(error.response?.data?.message || "Failed to clear cart");
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const platformFee = 10;
  const tax = Math.round(subtotal * 0.05);
  const finalTotal = subtotal - discountAmt + deliveryFee + platformFee + tax;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <FaShoppingBag className="text-4xl text-orange-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-1">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add items from a restaurant to get started</p>
        <button
          onClick={() => setPage("home")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold transition shadow-lg"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800">Your Cart</h2>
            <p className="text-xs text-gray-400 mt-0.5">{cart.length} item{cart.length > 1 ? "s" : ""} added</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-full transition"
          >
            Clear All
          </button>
        </div>

        {/* ITEMS */}
        <div className="space-y-3 mb-5">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              {/* VEG DOT */}
              <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${item.type === "veg" ? "border-green-600" : "border-red-600"}`}>
                <span className={`w-2 h-2 rounded-full ${item.type === "veg" ? "bg-green-600" : "bg-red-600"}`} />
              </span>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-800 truncate">{item.name}</h3>
                <p className="text-orange-500 font-bold text-sm mt-0.5">₹{item.price}</p>
              </div>

              {/* QTY CONTROLS */}
              <div className="flex items-center gap-2 bg-orange-50 rounded-xl overflow-hidden border border-orange-200">
                <button onClick={() => decrease(item)} className="px-3 py-2 text-orange-500 hover:bg-orange-100 transition">
                  <FaMinus className="text-[10px]" />
                </button>
                <span className="font-bold text-sm text-gray-800 w-5 text-center">{item.qty}</span>
                <button onClick={() => increase(item)} className="px-3 py-2 text-orange-500 hover:bg-orange-100 transition">
                  <FaPlus className="text-[10px]" />
                </button>
              </div>

              {/* ITEM TOTAL */}
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-gray-800">₹{item.price * item.qty}</p>
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition mt-1">
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FREE DELIVERY BANNER */}
        {deliveryFee > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <span className="text-blue-500 text-sm">🚚</span>
            <p className="text-xs text-blue-600 font-medium">
              Add ₹{300 - subtotal} more for <span className="font-bold">FREE delivery</span>
            </p>
          </div>
        )}
        {deliveryFee === 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <span className="text-green-500 text-sm">✅</span>
            <p className="text-xs text-green-600 font-bold">Free delivery unlocked!</p>
          </div>
        )}

        {/* COUPON */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MdLocalOffer className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Apply Coupon</h3>
          </div>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Try SAVE10 or FLAT50"
              className="border border-gray-200 p-2.5 flex-1 rounded-xl text-sm outline-none focus:border-orange-400 transition"
              disabled={couponApplied || loading}
            />
            <button
              onClick={couponApplied ? removeCoupon : applyCoupon}
              disabled={loading}
              className={`px-4 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                couponApplied 
                  ? "bg-gray-200 text-gray-600" 
                  : "bg-orange-500 text-white hover:bg-orange-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : null}
              {couponApplied ? "Remove" : "Apply"}
            </button>
          </div>
          {couponMsg && (
            <p className={`text-xs mt-2 font-medium ${couponApplied ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Available: <span className="font-semibold text-gray-500">SAVE10</span>, <span className="font-semibold text-gray-500">FLAT50</span></p>
        </div>

        {/* BILL SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span><span>₹{subtotal}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1"><FaTag className="text-xs" /> Coupon Discount</span>
                <span>- ₹{discountAmt.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span><span>₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span><span>₹{tax}</span>
            </div>
            <div className="border-t border-dashed border-gray-100 pt-2 mt-2 flex justify-between font-extrabold text-base text-gray-800">
              <span>Total</span><span className="text-orange-500">₹{finalTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* CHECKOUT BUTTON */}
        <button
          onClick={() => setPage("checkout")}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-xl transition"
        >
          Proceed to Checkout <FaArrowRight />
        </button>
      </div>
    </div>
  );
}

export default Cart;