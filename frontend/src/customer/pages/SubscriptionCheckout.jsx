// ── SubscriptionCheckout.jsx ─────────────────────────────────
import { useState, useEffect } from "react";
import { 
  FaCrown, FaLeaf, FaDrumstickBite, FaMapMarkerAlt, 
  FaCheckCircle, FaFire, FaSpinner 
} from "react-icons/fa";
import API from "../../services/axios"; // ADDED: Import axios config

const defaultPlans = {
  weekly:  { label: "Weekly",  price: 699,  per: "week",  features: ["Fresh Meals Daily", "Free Delivery", "Healthy Options"] },
  monthly: { label: "Monthly", price: 2499, per: "month", features: ["Fresh Meals Daily", "Free Delivery", "Healthy Options", "Priority Support", "Pause Anytime"] },
};

function SubscriptionCheckout({ setPage }) {
  const [plan, setPlan] = useState("monthly");
  const [mealType, setMealType] = useState("veg");
  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState([]); // ADDED: Saved addresses
  const [selectedAddressId, setSelectedAddressId] = useState(""); // ADDED
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [plans, setPlans] = useState(defaultPlans); // ADDED: Dynamic plans
  const [coupon, setCoupon] = useState(""); // ADDED: Coupon code
  const [discount, setDiscount] = useState(0);

  // ADDED: Fetch subscription plans and saved addresses
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFetchingAddresses(false);
        return;
      }

      try {
        // Fetch subscription plans
        const plansRes = await API.get("/customer/subscription/plans");
        if (plansRes.data.success) {
          setPlans(plansRes.data.data);
        }

        // Fetch saved addresses
        const addressRes = await API.get("/customer/me/addresses");
        if (addressRes.data.success && addressRes.data.data.length > 0) {
          setAddresses(addressRes.data.data);
          const defaultAddr = addressRes.data.data.find(addr => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setAddress(defaultAddr.address || defaultAddr.fullAddress);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setFetchingAddresses(false);
      }
    };

    fetchData();
  }, []);

  // ADDED: Format address for display
  const formatAddress = (addr) => {
    return addr.address || addr.fullAddress;
  };

  // ADDED: Handle address selection
  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress(formatAddress(addr));
  };

  // ADDED: Apply coupon
  const applyCoupon = async () => {
    if (!coupon.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    try {
      const response = await API.post("/customer/subscription/apply-coupon", {
        code: coupon,
        planType: plan
      });
      
      if (response.data.success) {
        setDiscount(response.data.data.discount);
        alert(`Coupon applied! ${response.data.data.discount}% off`);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      alert(error.response?.data?.message || "Invalid coupon code");
      setDiscount(0);
    }
  };

  // ADDED: Handle subscription purchase
  const handleSubscribe = async () => {
    if (!address.trim()) { 
      alert("Please enter your delivery address"); 
      return; 
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to subscribe");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    
    try {
      let finalAddressId = selectedAddressId;
      
      // If using a new address (not saved), save it first
      if (!selectedAddressId && address.trim()) {
        const addressResponse = await API.post("/customer/me/addresses", {
          type: "Home",
          address: address,
          fullAddress: address,
          isDefault: addresses.length === 0
        });
        
        if (addressResponse.data.success) {
          finalAddressId = addressResponse.data.data[addressResponse.data.data.length - 1]._id;
        }
      }

      // Create subscription
      const response = await API.post("/customer/subscription/create", {
        planType: plan,
        duration: plan === "weekly" ? 7 : 30,
        mealType: mealType,
        addressId: finalAddressId,
        couponCode: coupon || undefined
      });

      if (response.data.success) {
        // If payment is required, redirect to payment page
        if (response.data.data.paymentUrl) {
          window.location.href = response.data.data.paymentUrl;
        } else {
          // Subscription created successfully
          const savedPlan = plans[plan];
          alert(`Successfully subscribed to ${savedPlan.label} Plan! 🎉`);
          setPage("subscriptionSuccess");
        }
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert(error.response?.data?.message || "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  const current = plans[plan];
  const finalPrice = current?.price - (current?.price * discount / 100);
  const hasDiscount = discount > 0;

  // Loading state
  if (fetchingAddresses) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-md mx-auto px-4 pt-4 flex justify-center items-center min-h-[60vh]">
          <FaSpinner className="animate-spin text-orange-500 text-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">

        <h2 className="text-xl font-extrabold text-gray-800 mb-5">🍱 Subscribe to QuickBite</h2>

        {/* PLAN TOGGLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Choose Plan</h3>
          <div className="flex gap-3">
            {Object.entries(plans).map(([key, val]) => (
              <button 
                key={key} 
                onClick={() => setPlan(key)}
                className={`flex-1 rounded-2xl p-3 border-2 text-left transition ${plan === key ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50"}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {key === "monthly" && <FaCrown className="text-orange-500 text-xs" />}
                  <span className="font-bold text-sm text-gray-800">{val.label}</span>
                  {key === "monthly" && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><FaFire className="text-[8px]" />Best</span>}
                </div>
                <p className="text-orange-500 font-extrabold text-lg">
                  ₹{val.price}
                  <span className="text-xs text-gray-400 font-normal">/{val.per}</span>
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">What's included</h3>
          <div className="space-y-2">
            {current?.features.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</span>
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MEAL TYPE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Meal Preference</h3>
          <div className="flex gap-3">
            {[
              { val: "veg",     label: "Veg",     icon: <FaLeaf className="text-green-500" />, bg: "bg-green-50", border: "border-green-400" },
              { val: "non-veg", label: "Non-Veg", icon: <FaDrumstickBite className="text-red-500" />, bg: "bg-red-50", border: "border-red-400" },
            ].map((opt) => (
              <button 
                key={opt.val} 
                onClick={() => setMealType(opt.val)}
                className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1.5 text-xs font-bold transition ${mealType === opt.val ? `${opt.bg} ${opt.border}` : "border-gray-100 bg-gray-50 text-gray-500"}`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ADDRESS SECTION with saved addresses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Delivery Address</h3>
          </div>
          
          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Saved Addresses</p>
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-2 rounded-xl border cursor-pointer transition ${
                      selectedAddressId === addr._id 
                        ? "border-orange-400 bg-orange-50" 
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleAddressSelect(addr)}
                      className="accent-orange-500 mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{formatAddress(addr)}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <div className="text-center my-2">
                <span className="text-xs text-gray-400">or</span>
              </div>
            </div>
          )}

          {/* New Address Input */}
          <textarea 
            rows={2} 
            value={address} 
            onChange={(e) => {
              setAddress(e.target.value);
              if (addresses.length > 0) setSelectedAddressId("");
            }}
            placeholder={addresses.length > 0 ? "Enter a new delivery address..." : "Enter your full delivery address..."}
            className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none" 
          />
        </div>

        {/* COUPON SECTION - ADDED */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-500">🎫</span>
            <h3 className="font-bold text-sm text-gray-700">Apply Coupon</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              disabled={hasDiscount}
              className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition disabled:bg-gray-100"
            />
            <button
              onClick={hasDiscount ? () => setDiscount(0) : applyCoupon}
              className={`px-4 rounded-xl text-sm font-bold transition ${
                hasDiscount 
                  ? "bg-gray-200 text-gray-600" 
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {hasDiscount ? "Remove" : "Apply"}
            </button>
          </div>
          {hasDiscount && (
            <p className="text-xs text-green-600 mt-2">
              🎉 {discount}% discount applied! You saved ₹{(current?.price * discount / 100).toFixed(0)}
            </p>
          )}
        </div>

        {/* SUMMARY + CTA */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-4 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">You're subscribing to</p>
            <p className="font-extrabold text-gray-800">{current?.label} · {mealType === "veg" ? "🥦 Veg" : "🍗 Non-Veg"}</p>
            {hasDiscount && (
              <p className="text-xs text-green-600 line-through decoration-gray-400">
                Original: ₹{current?.price}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Total</p>
            <p className="font-extrabold text-orange-500 text-lg">
              ₹{Math.round(finalPrice)}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSubscribe} 
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-extrabold text-base text-white flex items-center justify-center gap-2 shadow-xl transition ${
            loading 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600"
          }`}
        >
          {loading ? (
            <><FaSpinner className="animate-spin" /> Processing...</>
          ) : (
            <><FaCheckCircle /> Pay ₹{Math.round(finalPrice)} & Subscribe</>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Cancel anytime • No hidden charges • Pause anytime</p>
      </div>
    </div>
  );
}

export default SubscriptionCheckout;