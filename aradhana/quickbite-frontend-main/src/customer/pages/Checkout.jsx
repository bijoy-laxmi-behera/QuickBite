import { useState } from "react";
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaMobile, FaCheckCircle, FaLock } from "react-icons/fa";

const paymentOptions = [
  { value: "cod",  label: "Cash on Delivery", icon: <FaMoneyBillWave className="text-green-500" />, desc: "Pay when your order arrives" },
  { value: "upi",  label: "UPI",              icon: <FaMobile className="text-blue-500" />,        desc: "PhonePe, GPay, Paytm" },
  { value: "card", label: "Credit / Debit Card", icon: <FaCreditCard className="text-purple-500" />, desc: "Visa, Mastercard, RuPay" },
];

function Checkout({ cart, setCart, setPage, setPayments }) {
  const [address, setAddress]     = useState("");
  const [payment, setPayment]     = useState("cod");
  const [loading, setLoading]     = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const subtotal   = cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
  const delivery   = subtotal > 300 ? 0 : 40;
  const total      = subtotal + delivery;

  const handlePlaceOrder = () => {
    if (!address.trim()) { alert("Please enter a delivery address"); return; }
    if (payment === "card" && !cardDetails.number) { alert("Please enter card details"); return; }

    if (payment === "card" && setPayments) {
      const saved = JSON.parse(localStorage.getItem("cards") || "[]");
      const updated = [...saved, { id: Date.now(), number: cardDetails.number, expiry: cardDetails.expiry, name: cardDetails.name }];
      localStorage.setItem("cards", JSON.stringify(updated));
      setPayments(updated);
    }

    setLoading(true);
    setTimeout(() => { setCart([]); setPage("success"); setLoading(false); }, 1200);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-4">

        <h2 className="text-xl font-extrabold text-gray-800 mb-5">Checkout 🧾</h2>

        {/* ADDRESS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaMapMarkerAlt className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Delivery Address</h3>
          </div>
          <textarea
            rows={2}
            placeholder="Enter your full delivery address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none"
          />
          <div className="flex gap-2 mt-2">
            {["Home", "Work", "Other"].map((tag) => (
              <button key={tag} className="text-xs border border-gray-200 px-3 py-1 rounded-full text-gray-500 hover:border-orange-400 hover:text-orange-500 transition">
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaLock className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Payment Method</h3>
          </div>
          <div className="space-y-2">
            {paymentOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${payment === opt.value ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}
              >
                <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="accent-orange-500" />
                <span className="text-lg">{opt.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {payment === "card" && (
            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              <input placeholder="Cardholder Name" value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <input placeholder="Card Number (16 digits)" value={cardDetails.number} maxLength={16}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <div className="flex gap-2">
                <input placeholder="MM/YY" value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
                <input placeholder="CVV" value={cardDetails.cvv} maxLength={3}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1"><FaLock className="text-green-400" /> Your card details are encrypted & secure</p>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Order Summary</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="truncate mr-2">{item.name} <span className="text-gray-400">× {item.qty || 1}</span></span>
                <span className="font-semibold shrink-0">₹{(item.price || 0) * (item.qty || 1)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-100 mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base text-gray-800 pt-1">
              <span>Total</span><span className="text-orange-500">₹{total}</span>
            </div>
          </div>
        </div>

        {/* PLACE ORDER */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-white font-extrabold text-base transition shadow-xl flex items-center justify-center gap-2 ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500"}`}
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            <><FaCheckCircle /> Pay ₹{total} & Place Order</>
          )}
        </button>
      </div>
    </div>
  );
}

export default Checkout;