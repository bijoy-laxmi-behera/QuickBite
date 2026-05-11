// delivery/components/DeliveryMap.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader, MapPin, Navigation } from 'lucide-react';

// You can use OpenStreetMap (free) instead of Google Maps
// This version uses Leaflet which is free and doesn't require API key

const DeliveryMap = ({ deliveryLocation, customerLocation, restaurantLocation, height = 'h-64', onRouteCalculated }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.L) {
      initMap();
      return;
    }

    setLoading(true);
    
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
      setLoading(false);
    };
    script.onerror = () => {
      console.error('Failed to load Leaflet');
      setLoading(false);
    };
    document.head.appendChild(script);
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.L) return;
    
    // Default center (Mumbai)
    const center = [19.0760, 72.8777];
    
    const map = window.L.map(mapRef.current).setView(center, 12);
    
    // Add tile layer (OpenStreetMap - free)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 3
    }).addTo(map);
    
    mapInstanceRef.current = map;
    setMapLoaded(true);
  };

  // Update map when locations change
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && (deliveryLocation || customerLocation || restaurantLocation)) {
      updateMapMarkers();
    }
  }, [mapLoaded, deliveryLocation, customerLocation, restaurantLocation]);

  const updateMapMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    
    // Clear existing markers
    if (window.markers) {
      window.markers.forEach(marker => marker.remove());
    }
    window.markers = [];
    
    // Clear existing routes
    if (window.currentRoute) {
      map.removeControl(window.currentRoute);
    }
    
    const bounds = [];
    
    // Add delivery partner marker (green)
    if (deliveryLocation && deliveryLocation.lat && deliveryLocation.lng) {
      const deliveryIcon = window.L.divIcon({
        html: `<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        popupAnchor: [0, -16]
      });
      
      const marker = window.L.marker([deliveryLocation.lat, deliveryLocation.lng], { icon: deliveryIcon })
        .addTo(map)
        .bindPopup('📦 Delivery Partner');
      
      window.markers.push(marker);
      bounds.push([deliveryLocation.lat, deliveryLocation.lng]);
    }
    
    // Add customer marker (blue)
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      const customerIcon = window.L.divIcon({
        html: `<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        popupAnchor: [0, -16]
      });
      
      const marker = window.L.marker([customerLocation.lat, customerLocation.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('🏠 Customer');
      
      window.markers.push(marker);
      bounds.push([customerLocation.lat, customerLocation.lng]);
    }
    
    // Add restaurant marker (orange)
    if (restaurantLocation && restaurantLocation.lat && restaurantLocation.lng) {
      const restaurantIcon = window.L.divIcon({
        html: `<div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 15v6" />
                </svg>
              </div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        popupAnchor: [0, -16]
      });
      
      const marker = window.L.marker([restaurantLocation.lat, restaurantLocation.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup('🍽️ Restaurant');
      
      window.markers.push(marker);
      bounds.push([restaurantLocation.lat, restaurantLocation.lng]);
    }
    
    // Draw route between delivery and customer
    if (deliveryLocation && customerLocation && deliveryLocation.lat && deliveryLocation.lng && customerLocation.lat && customerLocation.lng) {
      drawRoute(deliveryLocation, customerLocation);
    }
    
    // Fit bounds to show all markers
    if (bounds.length > 0) {
      const boundsObj = window.L.latLngBounds(bounds);
      map.fitBounds(boundsObj, { padding: [50, 50] });
    }
  };

  const drawRoute = async (start, end) => {
    if (!window.L || !window.L.Routing) {
      // If Leaflet Routing Machine is not available, use a simple polyline
      drawSimplePolyline(start, end);
      return;
    }
    
    // Use Leaflet Routing Machine for actual route
    const routingControl = window.L.Routing.control({
      waypoints: [
        window.L.latLng(start.lat, start.lng),
        window.L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      collapsible: false,
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false
    }).addTo(mapInstanceRef.current);
    
    window.currentRoute = routingControl;
    
    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
      const durationMin = Math.round(route.summary.totalTime / 60);
      
      setDistance(distanceKm);
      setDuration(durationMin);
      onRouteCalculated?.({ distance: distanceKm, duration: durationMin });
    });
  };

  const drawSimplePolyline = (start, end) => {
    const points = [
      [start.lat, start.lng],
      [end.lat, end.lng]
    ];
    
    const polyline = window.L.polyline(points, {
      color: '#f97316',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);
    
    window.currentRoute = polyline;
    
    // Calculate approximate distance using Haversine formula
    const distanceKm = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const durationMin = Math.round(distanceKm * 3); // Approx 3 min per km
    
    setDistance(distanceKm.toFixed(1));
    setDuration(durationMin);
    onRouteCalculated?.({ distance: distanceKm.toFixed(1), duration: durationMin });
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Loading state
  if (loading || !mapLoaded) {
    return (
      <div className={`${height} bg-gray-100 rounded-xl flex items-center justify-center`}>
        <Loader size={32} className="animate-spin text-orange-500" />
        <span className="ml-2 text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className={`${height} w-full rounded-xl overflow-hidden border border-gray-200`} />
      
      {/* Info overlay */}
      {(distance || duration) && (
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md">
          <div className="flex items-center gap-3 text-xs">
            {distance && (
              <div className="flex items-center gap-1">
                <Navigation size={12} className="text-orange-500" />
                <span className="text-gray-600">📏 {distance} km</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-1">
                <span>⏱️ {duration} min</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Delivery</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Customer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Restaurant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map Marker Component for individual display
export const MapMarker = ({ location, type = 'delivery', label, onClick }) => {
  if (!location || !location.lat || !location.lng) return null;
  
  const getMarkerColor = () => {
    switch (type) {
      case 'delivery': return 'bg-green-500';
      case 'customer': return 'bg-blue-500';
      case 'restaurant': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getMarkerIcon = () => {
    switch (type) {
      case 'delivery': return '📦';
      case 'customer': return '🏠';
      case 'restaurant': return '🍽️';
      default: return '📍';
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group relative"
    >
      <div className={`${getMarkerColor()} w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110`}>
        <span className="text-lg">{getMarkerIcon()}</span>
      </div>
      {label && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;