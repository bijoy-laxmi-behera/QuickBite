import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaHome, FaBriefcase, FaPlus, FaTrash, FaCheck, FaSpinner, FaCrosshairs } from "react-icons/fa";
import API from "../../services/axios";

const typeConfig = {
  Home:  { icon: <FaHome />,     color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-200" },
  Work:  { icon: <FaBriefcase />, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  Other: { icon: <FaMapMarkerAlt />, color: "text-green-500", bg: "bg-green-50",  border: "border-green-200" },
};

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

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [type, setType] = useState("Home");
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get("/customer/me/addresses");
      
      if (response.data.success) {
        const transformedAddresses = response.data.data.map((addr, index) => ({
          id: addr._id,
          _id: addr._id,
          type: addr.type || "Other",
          address: addr.address || addr.fullAddress,
          isDefault: addr.isDefault || index === 0,
          landmark: addr.landmark,
          city: addr.city,
          pincode: addr.pincode,
          phone: addr.phone,
          location: addr.location
        }));
        setAddresses(transformedAddresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      alert(error.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async () => {
    if (!input.trim()) {
      alert("Please enter an address");
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await API.post("/customer/me/addresses", {
        type: type,
        address: input,
        isDefault: addresses.length === 0,
        fullAddress: input,
        landmark: "",
        city: "",
        pincode: "",
        location: pickedLocation
      });

      if (response.data.success) {
        await fetchAddresses();
        setInput("");
        setPickedLocation(null);
        setAdding(false);
        setShowLocationPicker(false);
        alert("Address added successfully!");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert(error.response?.data?.message || "Failed to add address");
    } finally {
      setSubmitting(false);
    }
  };

  const removeAddress = async (id) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;
    
    try {
      const response = await API.delete(`/customer/me/addresses/${id}`);
      
      if (response.data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id && a._id !== id));
        alert("Address removed successfully!");
      }
    } catch (error) {
      console.error("Error removing address:", error);
      alert(error.response?.data?.message || "Failed to remove address");
    }
  };

  const setDefault = async (id) => {
    try {
      const response = await API.patch(`/customer/me/addresses/${id}/default`);
      
      if (response.data.success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id || a._id === id,
          }))
        );
        alert("Default address updated!");
      }
    } catch (error) {
      console.error("Error setting default:", error);
      alert(error.response?.data?.message || "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-orange-500" />
              <h2 className="text-xl font-extrabold text-gray-800">My Addresses</h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            <span className="ml-2 text-gray-500">Loading addresses...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">My Addresses</h2>
          </div>
          <button 
            onClick={() => {
              setAdding(!adding);
              setShowLocationPicker(false);
            }}
            disabled={submitting}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition disabled:opacity-50"
          >
            <FaPlus className="text-[10px]" /> Add New
          </button>
        </div>

        {/* ADD FORM */}
        {adding && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 mb-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Add New Address</h3>
            
            {/* Location Picker Toggle */}
            <button
              type="button"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="mb-3 text-xs text-orange-500 flex items-center gap-1 hover:underline"
            >
              📍 {showLocationPicker ? "Hide Location Picker" : "Use Live Location"}
            </button>
            
            {/* Location Picker */}
            {showLocationPicker && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                <LocationPicker 
                  onLocationSelect={(addr, coords) => {
                    setInput(addr);
                    setPickedLocation(coords);
                  }}
                  initialAddress={input}
                />
              </div>
            )}
            
            {/* Manual Address Input */}
            {!showLocationPicker && (
              <>
                <div className="flex gap-2 mb-3">
                  {Object.keys(typeConfig).map((t) => (
                    <button 
                      key={t} 
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${type === t ? `${typeConfig[t].bg} ${typeConfig[t].border} ${typeConfig[t].color}` : "bg-gray-50 border-gray-200 text-gray-500"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea 
                  rows={2} 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter full address with landmark..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition resize-none mb-3" 
                />
              </>
            )}
            
            <button 
              onClick={addAddress}
              disabled={submitting || !input.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : null}
              {submitting ? "Saving..." : "Save Address"}
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {addresses.length === 0 && !adding && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <FaMapMarkerAlt className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No addresses saved yet</p>
            <button 
              onClick={() => setAdding(true)}
              className="mt-3 text-orange-500 text-sm font-semibold hover:underline"
            >
              + Add your first address
            </button>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-3">
          {addresses.map((addr) => {
            const cfg = typeConfig[addr.type] || typeConfig.Other;
            return (
              <div key={addr.id || addr._id} className={`bg-white rounded-2xl shadow-sm border p-4 ${addr.isDefault ? "border-orange-200" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold ${cfg.color}`}>{addr.type}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-semibold">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{addr.address}</p>
                    {addr.landmark && (
                      <p className="text-xs text-gray-400 mt-1">📍 {addr.landmark}</p>
                    )}
                    {addr.location && (
                      <p className="text-xs text-gray-400 mt-1">📍 Live location saved</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {!addr.isDefault && (
                    <button 
                      onClick={() => setDefault(addr.id || addr._id)}
                      className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition font-semibold"
                    >
                      <FaCheck className="text-[10px]" /> Set Default
                    </button>
                  )}
                  <button 
                    onClick={() => removeAddress(addr.id || addr._id)}
                    className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold ml-auto"
                  >
                    <FaTrash className="text-[10px]" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Addresses;