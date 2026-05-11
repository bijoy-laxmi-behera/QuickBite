// delivery/components/DeliveryLocationTracker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin, Clock, Loader, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

const DeliveryLocationTracker = ({ orderId, onLocationUpdate }) => {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [isTracking]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        updateServerLocation(newLocation);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to get your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };
        setLocation(newLocation);
        setAccuracy(position.coords.accuracy);
        
        // Throttle server updates (every 3 seconds)
        if (!updateIntervalRef.current) {
          updateIntervalRef.current = setInterval(() => {
            if (locationRef.current) {
              updateServerLocation(locationRef.current);
            }
          }, 3000);
        }
      },
      (err) => {
        console.error("Watch position error:", err);
        setError("Location tracking interrupted");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const updateServerLocation = async (loc) => {
    if (!loc || !orderId) return;
    
    setUpdating(true);
    try {
      await API.patch(`/delivery/orders/${orderId}/location`, {
        lat: loc.lat,
        lng: loc.lng,
        accuracy: loc.accuracy
      });
      setLastUpdate(new Date());
      onLocationUpdate?.(loc);
    } catch (error) {
      console.error("Failed to update location:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getAccuracyColor = () => {
    if (!accuracy) return "text-gray-400";
    if (accuracy < 20) return "text-green-500";
    if (accuracy < 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Navigation size={18} className="text-orange-500" />
          Live Location Tracking
        </h3>
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`text-xs px-3 py-1 rounded-full transition ${
            isTracking 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>
      
      {error ? (
        <div className="bg-red-50 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : location ? (
        <div className="space-y-3">
          {/* Location Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-orange-500" />
                <span className="text-gray-600">Current Position:</span>
              </div>
              {updating && <Loader size={12} className="animate-spin text-orange-500" />}
            </div>
            <p className="text-xs text-gray-500 font-mono">
              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            </p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Accuracy:</span>
                <span className={getAccuracyColor()}>
                  ±{Math.round(accuracy)}m
                </span>
              </div>
              {lastUpdate && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={12} />
                  <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-gray-600">
                {isTracking ? 'Live tracking active' : 'Tracking paused'}
              </span>
            </div>
            {isTracking && (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi size={12} />
                <span className="text-xs">Sharing live location</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center py-6">
          <Loader size={24} className="animate-spin text-orange-500" />
          <span className="ml-2 text-gray-500">Getting your location...</span>
        </div>
      )}
      
      {/* Info Note */}
      <div className="mt-3 pt-3 border-t text-xs text-gray-400 flex items-center gap-1">
        <AlertCircle size={10} />
        <span>Location is shared with the customer for real-time tracking</span>
      </div>
    </div>
  );
};

export default DeliveryLocationTracker;