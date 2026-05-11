// delivery/components/OrderTracking.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Navigation, Phone, MessageCircle, Clock, 
  CheckCircle, Loader, Wifi, WifiOff, AlertCircle,
  ZoomIn, ZoomOut, RefreshCw, Target
} from 'lucide-react';
import API from '../../services/axios';
import toast from 'react-hot-toast';

// Use Leaflet for free maps (no API key required)
const OrderTracking = ({ orderId, onStatusUpdate }) => {
  const [order, setOrder] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('inactive');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const watchIdRef = useRef(null);
  const markerRef = useRef(null);
  const routeRef = useRef(null);

  // Load Leaflet map
  useEffect(() => {
    loadLeafletMap();
  }, []);

  const loadLeafletMap = () => {
    if (window.L) {
      initMap();
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => initMap();
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !window.L) return;
    
    const map = window.L.map(mapRef.current).setView([19.0760, 72.8777], 12);
    
    // Add tile layer (OpenStreetMap - free)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    mapInstanceRef.current = map;
    setMapLoaded(true);
  };

  useEffect(() => {
    fetchOrderDetails();
    setupSocket();
    
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [orderId]);

  useEffect(() => {
    if (mapLoaded && (deliveryLocation || customerLocation || restaurantLocation)) {
      updateMapMarkers();
    }
  }, [mapLoaded, deliveryLocation, customerLocation, restaurantLocation]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/delivery/orders/${orderId}`);
      const orderData = res.data;
      setOrder(orderData);
      
      if (orderData.customerLocation) {
        setCustomerLocation(orderData.customerLocation);
      }
      if (orderData.restaurantLocation) {
        setRestaurantLocation(orderData.restaurantLocation);
      }
      if (orderData.deliveryStatus) {
        setTrackingStatus(orderData.deliveryStatus);
      }
      
      // Start tracking if order is active
      if (['accepted', 'picked_up'].includes(orderData.deliveryStatus)) {
        startLocationTracking();
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setDeliveryLocation(location);
        updateLocationOnServer(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enable location services.');
      }
    );

    // Watch position for real-time updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setDeliveryLocation(location);
        updateLocationOnServer(location);
        
        // Calculate distance to customer
        if (customerLocation) {
          const dist = calculateDistance(location.lat, location.lng, customerLocation.lat, customerLocation.lng);
          setDistance(dist);
          const etaMinutes = Math.ceil(dist * 3); // ~3 min per km in city
          setEta(etaMinutes);
        }
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const updateLocationOnServer = async (location) => {
    try {
      await API.patch('/delivery/me/location', location);
      
      // Also update order location for customer tracking
      if (orderId) {
        await API.put('/customer/delivery/update-location', {
          orderId,
          lat: location.lat,
          lng: location.lng,
          status: trackingStatus
        });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const updateMapMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    
    // Clear existing markers
    if (markerRef.current) {
      Object.values(markerRef.current).forEach(marker => marker.remove());
    }
    markerRef.current = {};
    
    // Clear existing route
    if (routeRef.current) {
      routeRef.current.remove();
    }
    
    const bounds = [];
    
    // Add delivery marker (green)
    if (deliveryLocation && deliveryLocation.lat && deliveryLocation.lng) {
      const deliveryIcon = window.L.divIcon({
        html: `<div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
      });
      
      const marker = window.L.marker([deliveryLocation.lat, deliveryLocation.lng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup('<b>You</b><br>Your current location');
      
      markerRef.current.delivery = marker;
      bounds.push([deliveryLocation.lat, deliveryLocation.lng]);
    }
    
    // Add customer marker (blue)
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      const customerIcon = window.L.divIcon({
        html: `<div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
      });
      
      const marker = window.L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('<b>Customer</b><br>Delivery destination');
      
      markerRef.current.customer = marker;
      bounds.push([customerLocation.lat, customerLocation.lng]);
    }
    
    // Add restaurant marker (orange)
    if (restaurantLocation && restaurantLocation.lat && restaurantLocation.lng) {
      const restaurantIcon = window.L.divIcon({
        html: `<div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
                </svg>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
      });
      
      const marker = window.L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup('<b>Restaurant</b><br>Pickup location');
      
      markerRef.current.restaurant = marker;
      bounds.push([restaurantLocation.lat, restaurantLocation.lng]);
    }
    
    // Draw route between delivery and customer
    if (deliveryLocation && customerLocation && deliveryLocation.lat && customerLocation.lng) {
      const points = [
        [deliveryLocation.lat, deliveryLocation.lng],
        [customerLocation.lat, customerLocation.lng]
      ];
      
      routeRef.current = window.L.polyline(points, {
        color: '#f97316',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);
    }
    
    // Fit bounds to show all markers
    if (bounds.length > 0) {
      const boundsObj = window.L.latLngBounds(bounds);
      map.fitBounds(boundsObj, { padding: [50, 50] });
    }
  };

  const centerOnDelivery = () => {
    if (deliveryLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([deliveryLocation.lat, deliveryLocation.lng], 15);
    }
  };

  const setupSocket = () => {
    // Import socket from your socket service
    const socket = getSocket();
    if (socket) {
      socket.on('connect', () => setSocketConnected(true));
      socket.on('disconnect', () => setSocketConnected(false));
      socket.on('orderStatusUpdate', (data) => {
        if (data.orderId === orderId) {
          setTrackingStatus(data.status);
          if (data.customerLocation) setCustomerLocation(data.customerLocation);
          onStatusUpdate?.(data);
        }
      });
      setSocketConnected(socket.connected);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'accepted', label: 'Accepted', icon: '✅' },
      { key: 'picked_up', label: 'Picked Up', icon: '📦' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' }
    ];
    
    const currentIndex = steps.findIndex(s => s.key === trackingStatus);
    
    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      active: idx === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader className="animate-spin text-orange-500" size={40} />
        <p className="text-gray-500 mt-3">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-3" />
        <h3 className="text-lg font-semibold text-gray-800">Order Not Found</h3>
        <p className="text-gray-500 mt-1">The order you're looking for doesn't exist</p>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Navigation size={18} />
            <h3 className="font-semibold">Live Tracking</h3>
          </div>
          <div className="flex items-center gap-2">
            {socketConnected ? (
              <Wifi size={14} className="text-green-200" />
            ) : (
              <WifiOff size={14} className="text-red-200" />
            )}
            <span className="text-xs">
              {socketConnected ? 'Live' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between">
          {statusSteps.map((step, idx) => (
            <div key={step.key} className="flex-1 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                step.completed ? 'bg-green-500 text-white' : 
                step.active ? 'bg-orange-500 text-white animate-pulse' : 
                'bg-gray-300 text-gray-500'
              }`}>
                <span className="text-sm">{step.icon}</span>
              </div>
              <p className={`text-xs mt-1 ${
                step.completed ? 'text-green-600' : 
                step.active ? 'text-orange-600 font-medium' : 
                'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <div ref={mapRef} className="h-80 w-full bg-gray-100" />
        {deliveryLocation && (
          <button
            onClick={centerOnDelivery}
            className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          >
            <Target size={18} className="text-orange-500" />
          </button>
        )}
      </div>

      {/* Distance & ETA */}
      {distance !== null && eta !== null && trackingStatus !== 'delivered' && (
        <div className="grid grid-cols-2 gap-3 p-4 border-b bg-gradient-to-r from-orange-50 to-white">
          <div className="text-center">
            <p className="text-xs text-gray-500">Distance to Customer</p>
            <p className="text-xl font-bold text-orange-600">{distance.toFixed(1)} km</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Estimated Arrival</p>
            <p className="text-xl font-bold text-green-600">{eta} mins</p>
          </div>
        </div>
      )}

      {/* Order Info */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-semibold text-gray-800">#{order.orderId || order._id?.slice(-8)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="font-semibold text-orange-600 text-lg">₹{order.totalAmount}</p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 mb-1">Items</p>
          <div className="space-y-1">
            {order.items?.slice(0, 3).map((item, idx) => (
              <p key={idx} className="text-sm text-gray-600">
                {item.quantity}x {item.menuItem?.name || item.name}
              </p>
            ))}
            {order.items?.length > 3 && (
              <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={12} /> Delivery Address
          </p>
          <p className="text-sm mt-1 text-gray-700">
            {order.address?.street || order.address?.address}, {order.address?.city}
          </p>
          <p className="text-xs text-gray-500 mt-1">Phone: {order.address?.phone || order.user?.phone}</p>
        </div>

        {/* Customer Info */}
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">Customer</p>
          <div className="flex justify-between items-center mt-1">
            <div>
              <p className="font-medium text-gray-800">{order.user?.name || 'Customer'}</p>
              <p className="text-sm text-gray-500">{order.user?.phone || order.address?.phone}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${order.user?.phone || order.address?.phone}`}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                <Phone size={14} />
              </a>
              <a
                href={`https://wa.me/${order.user?.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                <MessageCircle size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {trackingStatus !== 'delivered' && (
          <div className="pt-3 border-t">
            {trackingStatus === 'accepted' && (
              <button
                onClick={() => onStatusUpdate?.('picked_up')}
                disabled={updating}
                className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {updating ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Mark as Picked Up
              </button>
            )}
            
            {trackingStatus === 'picked_up' && (
              <button
                onClick={() => onStatusUpdate?.('delivered')}
                disabled={updating}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {updating ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Mark as Delivered
              </button>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={fetchOrderDetails}
          className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw size={14} />
          Refresh Status
        </button>
      </div>
    </div>
  );
};

// Helper function to get socket instance
const getSocket = () => {
  // Implement your socket connection here
  return window.socket || null;
};

export default OrderTracking;