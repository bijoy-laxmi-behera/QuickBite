import { useState, useEffect } from "react";
import {
  FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaMobile,
  FaCheckCircle, FaLock, FaSpinner, FaCrosshairs, FaShieldAlt,
  FaTag, FaTimes,
} from "react-icons/fa";
import API from "../../services/axios";
import { triggerCartUpdate } from "../../services/helpers";

const RAZORPAY_KEY = "rzp_test_Sk3PQu4Ia7A5AG";

const paymentOptions = [
  { value: "cod",       label: "Cash on Delivery",   icon: <FaMoneyBillWave className="text-green-500" />,      desc: "Pay when your order arrives" },
  { value: "upi",       label: "UPI",                 icon: <FaMobile className="text-blue-500" />,              desc: "PhonePe, GPay, Paytm & more" },
  { value: "card",      label: "Credit / Debit Card", icon: <FaCreditCard className="text-purple-500" />,        desc: "Visa, Mastercard, RuPay — via Razorpay" },
  { value: "netbanking",label: "Net Banking",         icon: <span className="text-indigo-500 text-lg">🏦</span>, desc: "All major banks supported" },
  { value: "wallet",    label: "Wallets",             icon: <span className="text-pink-500 text-lg">👛</span>,   desc: "Paytm, Mobikwik, Freecharge" },
];

// ─── Location Picker ──────────────────────────────────────────────────────────
function LocationPicker({ onLocationSelect, initialAddress = "" }) {
  const [loading,       setLoading]       = useState(false);
  const [address,       setAddress]       = useState(initialAddress);
  const [coordinates,   setCoordinates]   = useState(null);
  const [locationError, setLocationError] = useState(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setCoordinates({ lat: latitude, lng: longitude });
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await res.json();
          const addr = data.display_name || `${latitude}, ${longitude}`;
          setAddress(addr);
          onLocationSelect(addr, { lat: latitude, lng: longitude });
        } catch {
          onLocationSelect(address, { lat: latitude, lng: longitude });
        }
        setLoading(false);
      },
      (err) => {
        const msgs = {
          [err.PERMISSION_DENIED]:    "Please enable location permissions.",
          [err.POSITION_UNAVAILABLE]: "Location information is unavailable.",
          [err.TIMEOUT]:              "Location request timed out.",
        };
        setLocationError("Unable to get your location. " + (msgs[err.code] || ""));
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Pick Location</span>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaCrosshairs />}
          Use Current Location
        </button>
      </div>
      <input
        type="text"
        value={address}
        onChange={e => { setAddress(e.target.value); onLocationSelect(e.target.value, coordinates); }}
        placeholder="Search or enter your full address..."
        className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition"
      />
      {locationError && <p className="text-xs text-red-500">{locationError}</p>}
      {coordinates   && <p className="text-xs text-gray-400">📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>}
    </div>
  );
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script  = document.createElement("script");
    script.src    = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror= () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Coupon Section ───────────────────────────────────────────────────────────
function CouponSection({ appliedCoupon, discountAmount, onApply, onRemove, restaurantId }) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/customer/me/cart/coupon", {
        code: code.trim().toUpperCase(),
        restaurantId,
      });
      if (data.success) {
        onApply(data.data);
        setCode("");
      } else {
        setError(data.message || "Invalid coupon");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Invalid coupon code");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await API.delete("/customer/me/cart/coupon");
      onRemove();
    } catch {}
  };

  // Applied state
  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <FaTag className="text-green-500" />
          <div>
            <p className="text-sm font-bold text-green-700">{appliedCoupon}</p>
            <p className="text-xs text-green-600">You save ₹{discountAmount}</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-gray-400 hover:text-red-500 transition p-1"
          title="Remove coupon"
        >
          <FaTimes />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleApply()}
          placeholder="Enter coupon code"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase outline-none focus:border-orange-400 transition"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}

// ─── Main Checkout component ──────────────────────────────────────────────────
function Checkout({ cart, setCart, setPage }) {
  const [addresses,          setAddresses]          = useState([]);
  const [selectedAddressId,  setSelectedAddressId]  = useState("");
  const [address,            setAddress]            = useState("");
  const [addressType,        setAddressType]        = useState("Home");
  const [payment,            setPayment]            = useState("cod");
  const [loading,            setLoading]            = useState(false);
  const [fetchingAddresses,  setFetchingAddresses]  = useState(true);
  const [couponDiscount,     setCouponDiscount]     = useState(0);
  const [appliedCoupon,      setAppliedCoupon]      = useState("");
  const [user,               setUser]               = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pickedLocation,     setPickedLocation]     = useState(null);
  const [restaurantId,       setRestaurantId]       = useState(null);

  // ── Fetch addresses + user + cart coupon + restaurantId ───────────────────
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setFetchingAddresses(false); return; }
      try {
        const [userRes, addressRes, cartRes] = await Promise.all([
          API.get("/customer/me"),
          API.get("/customer/me/addresses"),
          API.get("/customer/me/cart"),
        ]);

        if (userRes.data.success) setUser(userRes.data.data);

        if (addressRes.data.success && addressRes.data.data.length > 0) {
          setAddresses(addressRes.data.data);
          const def = addressRes.data.data.find(a => a.isDefault);
          if (def) {
            setSelectedAddressId(def._id);
            setAddress(def.address || def.fullAddress);
            setPickedLocation(def.location);
          }
        }

        if (cartRes.data.success) {
          if (cartRes.data.data.coupon)   setAppliedCoupon(cartRes.data.data.coupon);
          if (cartRes.data.data.discount) setCouponDiscount(cartRes.data.data.discount);

          // Derive restaurantId from first cart item (for coupon vendor check)
          const firstItem = cartRes.data.data.items?.[0];
          const rid = firstItem?.menuItem?.restaurant || firstItem?.menuItem?.vendor;
          if (rid) setRestaurantId(rid);
        }
      } catch (err) {
        console.error("fetchData:", err);
      } finally {
        setFetchingAddresses(false);
      }
    };
    fetchData();
  }, []);

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal    = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const delivery    = subtotal > 300 ? 0 : 40;
  const platformFee = 10;
  const tax         = Math.round(subtotal * 0.05);
  const discountAmt = couponDiscount; // already a ₹ amount from backend
  const total       = Math.max(0, subtotal + delivery + platformFee + tax - discountAmt);

  // ── Coupon handlers ───────────────────────────────────────────────────────
  const handleCouponApplied = ({ coupon, discount }) => {
    setAppliedCoupon(coupon);
    setCouponDiscount(discount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon("");
    setCouponDiscount(0);
  };

  // ── Address helpers ───────────────────────────────────────────────────────
  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress(addr.address || addr.fullAddress);
    setAddressType(addr.type || "Home");
    setPickedLocation(addr.location);
  };

  const saveNewAddress = async () => {
    if (!address.trim()) return null;
    try {
      const res = await API.post("/customer/me/addresses", {
        type: addressType, address, fullAddress: address,
        isDefault: addresses.length === 0,
        landmark: "", city: "", pincode: "",
        location: pickedLocation,
      });
      if (res.data.success) {
        const refreshRes = await API.get("/customer/me/addresses");
        if (refreshRes.data.success) {
          setAddresses(refreshRes.data.data);
          return refreshRes.data.data[refreshRes.data.data.length - 1];
        }
      }
    } catch (err) { console.error("saveNewAddress:", err); throw err; }
    return null;
  };

  // ── Razorpay ──────────────────────────────────────────────────────────────
  const openRazorpay = (rzpOrder) => {
    return new Promise((resolve, reject) => {
      const options = {
        key:         RAZORPAY_KEY,
        amount:      rzpOrder.amount,
        currency:    rzpOrder.currency || "INR",
        name:        "QuickBite",
        description: "Food Order Payment",
        image:       "/logo.png",
        order_id:    rzpOrder.id,
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#f97316" },
        method: payment === "upi"        ? { upi: true,  card: false, netbanking: false, wallet: false }
               : payment === "card"       ? { card: true, upi: false,  netbanking: false, wallet: false }
               : payment === "netbanking" ? { netbanking: true, card: false, upi: false,  wallet: false }
               : payment === "wallet"     ? { wallet: true,     card: false, upi: false,  netbanking: false }
               : undefined,
        handler: (response) => resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId:   response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        }),
        modal: { ondismiss: () => reject(new Error("Payment cancelled by user")) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed")));
      rzp.open();
    });
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!address || !address.trim()) { alert("Please enter a delivery address"); return; }
    const token = localStorage.getItem("token");
    if (!token) { alert("Please login to place order"); window.location.href = "/login"; return; }

    setLoading(true);
    try {
      let finalAddressId = selectedAddressId;
      if (!selectedAddressId && address.trim()) {
        const saved = await saveNewAddress();
        if (saved) finalAddressId = saved._id;
      }

      let customerLocation = pickedLocation;
      if (!customerLocation && navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          customerLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          await API.post("/customer/location/save", customerLocation);
        } catch {}
      }

      const orderPayload = {
        addressId:       finalAddressId,
        paymentMethod:   payment,
        customerLocation,
        address: {
          street: address, city: "City", pincode: "000000",
          landmark: "", fullName: user?.name || "Customer", phone: user?.phone || "",
        },
        addressText:   address,
        couponCode:    appliedCoupon || undefined,
        customerName:  user?.name,
        customerPhone: user?.phone,
        customerEmail: user?.email,
      };

      if (payment === "cod") {
        const res = await API.post("/customer/me/orders", orderPayload);
        if (res.data.success) {
          const orderId = res.data.data?._id || res.data.data?.orderId;
          if (orderId) { localStorage.setItem("lastOrderId", orderId); localStorage.setItem("trackingOrderId", orderId); }
          setCart([]); triggerCartUpdate(); setPage("success");
        } else {
          alert(res.data.message || "Failed to place order");
        }
        return;
      }

      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) { alert("Failed to load Razorpay."); return; }

      const rzpCreateRes = await API.post("/customer/payments/create-razorpay-order", {
        amount: total, currency: "INR", receipt: `receipt_${Date.now()}`, paymentMethod: payment,
      });
      if (!rzpCreateRes.data.success) { alert(rzpCreateRes.data.message || "Could not initiate payment"); return; }

      let paymentResult;
      try {
        paymentResult = await openRazorpay(rzpCreateRes.data.data);
      } catch (err) { alert(err.message || "Payment was not completed"); return; }

      const verifyRes = await API.post("/customer/payments/verify-and-place-order", {
        ...orderPayload,
        razorpayOrderId:   paymentResult.razorpayOrderId,
        razorpayPaymentId: paymentResult.razorpayPaymentId,
        razorpaySignature: paymentResult.razorpaySignature,
      });

      if (verifyRes.data.success) {
        const orderId = verifyRes.data.data?._id || verifyRes.data.data?.orderId;
        if (orderId) { localStorage.setItem("lastOrderId", orderId); localStorage.setItem("trackingOrderId", orderId); }
        setCart([]); triggerCartUpdate(); setPage("success");
      } else {
        alert(verifyRes.data.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("handlePlaceOrder error:", err);
      alert(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Address UI ────────────────────────────────────────────────────────────
  const renderAddressSection = () => {
    if (fetchingAddresses) return (
      <div className="flex justify-center py-4">
        <FaSpinner className="animate-spin text-orange-500 text-xl" />
      </div>
    );

    return (
      <>
        {addresses.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Saved Addresses</p>
            <div className="space-y-2">
              {addresses.map(addr => (
                <label key={addr._id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedAddressId === addr._id ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"
                  }`}>
                  <input type="radio" name="savedAddress"
                    checked={selectedAddressId === addr._id}
                    onChange={() => handleAddressSelect(addr)}
                    className="accent-orange-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{addr.type || "Home"}</span>
                      {addr.isDefault && <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{addr.address || addr.fullAddress}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="text-center my-3">
              <span className="text-xs text-gray-400">— or enter a new address —</span>
            </div>
          </div>
        )}

        <button type="button" onClick={() => { setShowLocationPicker(!showLocationPicker); if (addresses.length > 0) setSelectedAddressId(""); }}
          className="mb-3 text-xs text-orange-500 flex items-center gap-1 hover:underline">
          📍 {showLocationPicker ? "Hide Location Picker" : "Use Live Location"}
        </button>

        {showLocationPicker ? (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl">
            <LocationPicker
              onLocationSelect={(addr, coords) => { setAddress(addr); setPickedLocation(coords); if (addresses.length > 0) setSelectedAddressId(""); }}
              initialAddress={address}
            />
          </div>
        ) : (
          <div>
            <textarea rows={3}
              placeholder={addresses.length > 0 ? "Or type a new delivery address..." : "Enter your full delivery address..."}
              value={address}
              onChange={e => { setAddress(e.target.value); if (addresses.length > 0) setSelectedAddressId(""); }}
              className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none" />
            <div className="flex gap-2 mt-2">
              {["Home", "Work", "Other"].map(tag => (
                <button key={tag} type="button" onClick={() => setAddressType(tag)}
                  className={`text-xs border px-3 py-1 rounded-full transition ${
                    addressType === tag ? "border-orange-400 bg-orange-50 text-orange-500" : "border-gray-200 text-gray-500 hover:border-orange-300"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Example: 123, MG Road, Bhubaneswar - 751001</p>
          </div>
        )}
      </>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <h2 className="text-xl font-extrabold text-gray-800 mb-5">Checkout 🧾</h2>

        {/* ── ADDRESS ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaMapMarkerAlt className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Delivery Address</h3>
          </div>
          {renderAddressSection()}
        </div>

        {/* ── COUPON ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaTag className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Coupon Code</h3>
          </div>
          <CouponSection
            appliedCoupon={appliedCoupon}
            discountAmount={discountAmt}
            restaurantId={restaurantId}
            onApply={handleCouponApplied}
            onRemove={handleCouponRemoved}
          />
        </div>

        {/* ── PAYMENT METHOD ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaLock className="text-orange-500" />
            <h3 className="font-bold text-sm text-gray-700">Payment Method</h3>
          </div>
          <div className="space-y-2">
            {paymentOptions.map(opt => (
              <label key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  payment === opt.value ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"
                }`}>
                <input type="radio" name="payment" value={opt.value}
                  checked={payment === opt.value} onChange={() => setPayment(opt.value)}
                  className="accent-orange-500" />
                <span className="text-lg">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
                {opt.value !== "cod" && (
                  <span className="text-[10px] text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                    Razorpay
                  </span>
                )}
              </label>
            ))}
          </div>
          {payment !== "cod" && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
              <FaShieldAlt className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-700">Secured by Razorpay</p>
                <p className="text-xs text-blue-500 mt-0.5">Your payment details are encrypted and never stored on our servers.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── ORDER SUMMARY ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Order Summary</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="truncate mr-2">{item.name} <span className="text-gray-400">× {item.qty || 1}</span></span>
                <span className="font-semibold shrink-0">₹{(item.price || 0) * (item.qty || 1)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-gray-100 mt-3 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Coupon ({appliedCoupon})</span><span>− ₹{discountAmt}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between text-gray-500"><span>Platform Fee</span><span>₹{platformFee}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax (5%)</span><span>₹{tax}</span></div>
            <div className="flex justify-between font-extrabold text-base text-gray-800 pt-2 border-t border-dashed border-gray-100 mt-1">
              <span>Total</span>
              <span className="text-orange-500">₹{total}</span>
            </div>
          </div>
        </div>

        {/* ── PLACE ORDER ──────────────────────────────────────────────────── */}
        <button onClick={handlePlaceOrder} disabled={loading}
          className={`w-full py-4 rounded-2xl text-white font-extrabold text-base transition shadow-xl flex items-center justify-center gap-2 ${
            loading ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500"
          }`}>
          {loading      ? <><FaSpinner className="animate-spin" /> Processing...</>
          : payment === "cod" ? <><FaCheckCircle /> Place Order — ₹{total}</>
          : <><FaLock /> Pay ₹{total} via Razorpay</>}
        </button>

        {payment !== "cod" && !loading && (
          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <FaShieldAlt className="text-green-400" /> 256-bit SSL · PCI DSS compliant · Powered by Razorpay
          </p>
        )}
      </div>
    </div>
  );
}

export default Checkout;