import { useState } from "react";
import { FaTrash, FaPlus, FaMinus, FaTag, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";

function Cart({ cart, setCart, setPage }) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const increase = (item) =>
    setCart((prev) => prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));

  const decrease = (item) =>
    setCart((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0)
    );

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => { setCart([]); setDiscount(0); setCoupon(""); setCouponApplied(false); setCouponMsg(""); };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "SAVE10") {
      setDiscount(0.1);
      setCouponApplied(true);
      setCouponMsg("10% off applied! 🎉");
    } else if (coupon.toUpperCase() === "FLAT50") {
      setDiscount(0.15);
      setCouponApplied(true);
      setCouponMsg("15% off applied! 🎉");
    } else {
      setDiscount(0);
      setCouponApplied(false);
      setCouponMsg("Invalid coupon code ❌");
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmt = subtotal * discount;
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const finalTotal = subtotal - discountAmt + deliveryFee;

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
              disabled={couponApplied}
            />
            <button
              onClick={couponApplied ? () => { setDiscount(0); setCouponApplied(false); setCoupon(""); setCouponMsg(""); } : applyCoupon}
              className={`px-4 rounded-xl text-sm font-bold transition ${couponApplied ? "bg-gray-200 text-gray-600" : "bg-orange-500 text-white hover:bg-orange-600"}`}
            >
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