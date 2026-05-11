import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave, FaMobile, FaCheckCircle, FaLock, FaSpinner, FaCrosshairs } from "react-icons/fa";
import API from "../../services/axios";
import { triggerCartUpdate } from "../../services/helpers";

const paymentOptions = [
  { value: "cod",  label: "Cash on Delivery", icon: <FaMoneyBillWave className="text-green-500" />, desc: "Pay when your order arrives" },
  { value: "upi",  label: "UPI",              icon: <FaMobile className="text-blue-500" />,        desc: "PhonePe, GPay, Paytm" },
  { value: "card", label: "Credit / Debit Card", icon: <FaCreditCard className="text-purple-500" />, desc: "Visa, Mastercard, RuPay" },
];

// Location Picker Component
function LocationPicker({ onLocationSelect, initialAddress = "" }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        try {
          const addressText = await reverseGeocode(latitude, longitude);
          setAddress(addressText);
          onLocationSelect(addressText, { lat: latitude, lng: longitude });
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          onLocationSelect(address, { lat: latitude, lng: longitude });
        }
        setLoading(false);
      },
      (error) => {
        let errorMsg = "Unable to get your location. ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
        }
        setLocationError(errorMsg);
        setLoading(false);
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) return data.display_name;
      return `${lat}, ${lng}`;
    } catch (error) {
      return `${lat}, ${lng}`;
    }
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
        onChange={(e) => {
          setAddress(e.target.value);
          onLocationSelect(e.target.value, coordinates);
        }}
        placeholder="Search or enter your full address..."
        className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition"
      />

      {locationError && (
        <p className="text-xs text-red-500">{locationError}</p>
      )}

      {coordinates && (
        <p className="text-xs text-gray-400">
          📍 Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}

function Checkout({ cart, setCart, setPage, setPayments }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [address, setAddress] = useState("");
  const [addressType, setAddressType] = useState("Home");
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [user, setUser] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  // Fetch addresses, user profile, and cart coupon on mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFetchingAddresses(false);
        return;
      }

      try {
        // Fetch user profile
        const userRes = await API.get("/customer/me");
        if (userRes.data.success) {
          setUser(userRes.data.data);
        }

        // Fetch saved addresses
        const addressRes = await API.get("/customer/me/addresses");
        if (addressRes.data.success && addressRes.data.data.length > 0) {
          setAddresses(addressRes.data.data);
          const defaultAddr = addressRes.data.data.find(addr => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setAddress(defaultAddr.address || defaultAddr.fullAddress);
            setPickedLocation(defaultAddr.location);
          }
        }

        // Fetch cart to get applied coupon
        const cartRes = await API.get("/customer/me/cart");
        if (cartRes.data.success && cartRes.data.data.coupon) {
          setAppliedCoupon(cartRes.data.data.coupon);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setFetchingAddresses(false);
      }
    };

    fetchData();
  }, []);

  // Calculate totals
  const subtotal = cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
  const delivery = subtotal > 300 ? 0 : 40;
  const platformFee = 10;
  const tax = Math.round(subtotal * 0.05);
  const discountAmt = subtotal * (couponDiscount / 100);
  const total = subtotal + delivery + platformFee + tax - discountAmt;

  // Handle address selection from saved addresses
  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr._id);
    setAddress(addr.address || addr.fullAddress);
    setAddressType(addr.type || "Home");
    setPickedLocation(addr.location);
  };

  // Save new address to backend
  const saveNewAddress = async () => {
    if (!address.trim()) return null;
    
    try {
      const response = await API.post("/customer/me/addresses", {
        type: addressType,
        address: address,
        fullAddress: address,
        isDefault: addresses.length === 0,
        landmark: "",
        city: "",
        pincode: "",
        location: pickedLocation
      });
      
      if (response.data.success) {
        // Refresh addresses list
        const refreshRes = await API.get("/customer/me/addresses");
        if (refreshRes.data.success) {
          setAddresses(refreshRes.data.data);
          const newAddress = refreshRes.data.data[refreshRes.data.data.length - 1];
          return newAddress;
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      throw error;
    }
    return null;
  };
  // Handle place order
const handlePlaceOrder = async () => {
  // Validate address
  if (!address || typeof address !== 'string' || address.trim() === "") {
    alert("Please enter a delivery address");
    return;
  }
  
  if (payment === "card" && !cardDetails.number) { 
    alert("Please enter card details"); 
    return; 
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to place order");
    window.location.href = "/login";
    return;
  }

  setLoading(true);

  try {
    let finalAddressId = selectedAddressId;
    
    // If using a new address (not saved), save it first
    if (!selectedAddressId && address && address.trim()) {
      const savedAddress = await saveNewAddress();
      if (savedAddress) {
        finalAddressId = savedAddress._id;
      }
    }

    // Get customer location (use picked location or get current)
    let customerLocation = pickedLocation;
    if (!customerLocation && navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        customerLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        await API.post("/customer/location/save", customerLocation);
      } catch (geoError) {
        console.log("Location permission denied:", geoError);
      }
    }

    // FIXED: Prepare order data with proper address structure
    const orderData = {
      addressId: finalAddressId,
      paymentMethod: payment,
      customerLocation: customerLocation,
      address: {
        street: address,
        city: "City", // You can add a city input field or extract from address
        pincode: "000000", // You can add a pincode input field
        landmark: "",
        fullName: user?.name || "Customer",
        phone: user?.phone || ""
      },
      addressText: address, // Add as fallback
      couponCode: appliedCoupon || undefined,
      customerName: user?.name,
      customerPhone: user?.phone,
      customerEmail: user?.email 
    };

    console.log("Order data being sent:", orderData);

    // For card payments, save card details
    if (payment === "card" && setPayments && cardDetails.number) {
      const saved = JSON.parse(localStorage.getItem("cards") || "[]");
      const updated = [...saved, { 
        id: Date.now(), 
        number: cardDetails.number.slice(-4),
        expiry: cardDetails.expiry, 
        name: cardDetails.name 
      }];
      localStorage.setItem("cards", JSON.stringify(updated));
      setPayments(updated);
    }

    // Place order via API
    const response = await API.post("/customer/me/orders", orderData);

    if (response.data.success) {
      if (setCart) setCart([]);
      triggerCartUpdate();
      if (setPage) setPage("success");
    } else {
      alert(response.data.message || "Failed to place order");
    }
  } catch (error) {
    console.error("Order placement error:", error);
    const errorMsg = error.response?.data?.message || "Failed to place order. Please try again.";
    alert(errorMsg);
  } finally {
    setLoading(false);
  }
};
      

  // Render address selection UI
  const renderAddressSection = () => {
    if (fetchingAddresses) {
      return (
        <div className="flex justify-center py-4">
          <FaSpinner className="animate-spin text-orange-500 text-xl" />
        </div>
      );
    }

    return (
      <>
        {/* Saved Addresses */}
        {addresses.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Saved Addresses</p>
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{addr.type || "Home"}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{addr.address || addr.fullAddress}</p>
                    {addr.location && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 Live location saved</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="text-center my-3">
              <span className="text-xs text-gray-400">- OR -</span>
            </div>
          </div>
        )}

        {/* Location Picker Toggle */}
        <button
          type="button"
          onClick={() => {
            setShowLocationPicker(!showLocationPicker);
            if (addresses.length > 0) setSelectedAddressId("");
          }}
          className="mb-3 text-xs text-orange-500 flex items-center gap-1 hover:underline"
        >
          📍 {showLocationPicker ? "Hide Location Picker" : "Use Live Location"}
        </button>

        {/* Location Picker */}
        {showLocationPicker && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl">
            <LocationPicker 
              onLocationSelect={(addr, coords) => {
                setAddress(addr);
                setPickedLocation(coords);
                if (addresses.length > 0) setSelectedAddressId("");
              }}
              initialAddress={address}
            />
          </div>
        )}

        {/* Manual Address Input */}
        {!showLocationPicker && (
          <div>
            <textarea
              rows={3}
              placeholder={addresses.length > 0 ? "Enter a new delivery address..." : "Enter your full delivery address..."}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (addresses.length > 0) setSelectedAddressId("");
              }}
              className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition resize-none"
            />
            <div className="flex gap-2 mt-2">
              {["Home", "Work", "Other"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setAddressType(tag)}
                  className={`text-xs border px-3 py-1 rounded-full transition ${
                    addressType === tag 
                      ? "border-orange-400 bg-orange-50 text-orange-500" 
                      : "border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Example: 123, Main Street, Andheri West, Mumbai - 400053
            </p>
          </div>
        )}
      </>
    );
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
          {renderAddressSection()}
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
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '') })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <div className="flex gap-2">
                <input placeholder="MM/YY" value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
                <input placeholder="CVV" value={cardDetails.cvv} maxLength={3} type="password"
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
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
            {discountAmt > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span><span>- ₹{discountAmt.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Platform Fee</span><span>₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (5%)</span><span>₹{tax}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base text-gray-800 pt-1 border-t border-dashed border-gray-100 mt-1">
              <span>Total</span><span className="text-orange-500">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* PLACE ORDER BUTTON */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-white font-extrabold text-base transition shadow-xl flex items-center justify-center gap-2 ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500"}`}
        >
          {loading ? (
            <><FaSpinner className="animate-spin" /> Processing...</>
          ) : (
            <><FaCheckCircle /> Pay ₹{total.toFixed(0)} & Place Order</>
          )}
        </button>
      </div>
    </div>
  );
}

export default Checkout;