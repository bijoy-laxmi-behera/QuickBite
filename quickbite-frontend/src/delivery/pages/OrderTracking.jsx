import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "@/services/axios";
import toast from "react-hot-toast";

// Fix default Leaflet marker icons (Vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Orange delivery bike icon
const bikeIcon = new L.DivIcon({
  html: `<div style="
    background: #f97316;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">🚴</div>`,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Auto-pan map when location updates
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  return null;
}

const STATUS_CONFIG = {
  assigned:  { label: "Delivery Partner Assigned",  color: "bg-blue-100 text-blue-700",   emoji: "🧑‍💼" },
  picked_up: { label: "Order Picked Up — On the Way!", color: "bg-orange-100 text-orange-700", emoji: "🚴" },
  delivered: { label: "Order Delivered!",            color: "bg-green-100 text-green-700", emoji: "✅" },
};

export default function OrderTracking({ orderId }) {
  const [location, setLocation]         = useState(null);
  const [deliveryStatus, setStatus]     = useState(null);
  const [order, setOrder]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const intervalRef                     = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
    startPolling();
    return () => stopPolling();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/${orderId}`);
      setOrder(res.data.order);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const pollLocation = async () => {
    try {
      const res = await API.get(`/delivery/orders/${orderId}/location`);
      if (res.data.location) {
        setLocation(res.data.location);
        setLastUpdated(new Date());
      }
      if (res.data.deliveryStatus) {
        setStatus(res.data.deliveryStatus);
        // Stop polling once delivered
        if (res.data.deliveryStatus === "delivered") {
          stopPolling();
        }
      }
    } catch {
      // silent
    }
  };

  const startPolling = () => {
    pollLocation(); // immediate
    intervalRef.current = setInterval(pollLocation, 5000); // every 5s
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const statusInfo = STATUS_CONFIG[deliveryStatus] || null;

  // Default center: Bhubaneswar (fallback if no location yet)
  const mapCenter = location
    ? [location.lat, location.lng]
    : [20.2961, 85.8245];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Track Your Order</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          Order #{orderId?.slice(-6).toUpperCase()}
        </p>
      </div>

      {/* Status Badge */}
      {statusInfo && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${statusInfo.color}`}>
          <span className="text-xl">{statusInfo.emoji}</span>
          {statusInfo.label}
          {deliveryStatus === "picked_up" && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "380px" }}>
        {location ? (
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]} icon={bikeIcon}>
              <Popup>
                <div className="text-sm font-semibold">🚴 Delivery Partner</div>
                {lastUpdated && (
                  <div className="text-xs text-gray-400 mt-1">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </Popup>
            </Marker>
            <MapUpdater position={location} />
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-sm font-medium">Waiting for delivery partner location...</p>
            <p className="text-xs mt-1">Map will appear once they start moving</p>
          </div>
        )}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-gray-400 text-center">
          📡 Location last updated at {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Order Summary */}
      {order && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name || item.menuItem?.name} × {item.quantity}
                </span>
                <span className="font-semibold text-gray-800">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
              <span>Total</span>
              <span className="text-orange-500">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivered Message */}
      {deliveryStatus === "delivered" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-green-700">Your order has been delivered!</p>
          <p className="text-sm text-green-600 mt-1">Enjoy your meal!</p>
        </div>
      )}

    </div>
  );
}
