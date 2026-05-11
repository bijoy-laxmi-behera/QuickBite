// src/customer/components/LocationPicker.jsx
import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaCrosshairs, FaSpinner } from "react-icons/fa";

function LocationPicker({ onLocationSelect, initialAddress = "" }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Get current location
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
        
        // Reverse geocoding to get address from coordinates
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
        console.error("Geolocation error:", error);
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

  // Reverse geocoding using OpenStreetMap Nominatim (free, no API key needed)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        return data.display_name;
      }
      return `${lat}, ${lng}`;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return `${lat}, ${lng}`;
    }
  };

  // Search address using OpenStreetMap
  const searchAddress = async (query) => {
    if (!query || query.length < 3) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        // You can show a dropdown of results
        const firstResult = data[0];
        setCoordinates({
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon)
        });
        setAddress(firstResult.display_name);
        onLocationSelect(firstResult.display_name, {
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon)
        });
      }
    } catch (error) {
      console.error("Address search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Location Picker Header */}
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
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaCrosshairs />
          )}
          Use Current Location
        </button>
      </div>

      {/* Address Input */}
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onLocationSelect(e.target.value, coordinates);
          }}
          placeholder="Search or enter your full address..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition pr-20"
        />
        <button
          type="button"
          onClick={() => searchAddress(address)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-orange-500 hover:text-orange-600"
        >
          Search
        </button>
      </div>

      {/* Error Message */}
      {locationError && (
        <p className="text-xs text-red-500">{locationError}</p>
      )}

      {/* Coordinates Display (Optional) */}
      {coordinates && (
        <p className="text-xs text-gray-400">
          📍 Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      )}

      {/* Map Preview (Optional - shows a static map) */}
      {coordinates && (
        <div className="mt-2 rounded-xl overflow-hidden border border-gray-200">
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=400x200&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`}
            alt="Location preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default LocationPicker;