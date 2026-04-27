import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
} from "react-leaflet";
import L from "leaflet";

// Fix marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom bike icon
const bikeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  iconSize: [40, 40],
});

const OrderDetails = () => {
  const { id } = useParams();

  const restaurant = [20.353, 85.819];
  const customer = [20.296, 85.824];

  const [position, setPosition] = useState(restaurant);
  const [eta, setEta] = useState(15);

  // movement simulation
  useEffect(() => {
    let step = 0;
    const totalSteps = 60;

    const interval = setInterval(() => {
      step++;

      const lat =
        restaurant[0] +
        ((customer[0] - restaurant[0]) * step) / totalSteps;

      const lng =
        restaurant[1] +
        ((customer[1] - restaurant[1]) * step) / totalSteps;

      setPosition([lat, lng]);

      if (step >= totalSteps) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ETA countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStatus = () => {
    if (eta > 10) return "Picked Up";
    if (eta > 3) return "On the Way";
    return "Arriving Soon";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Track Order</h1>
        <p className="text-sm text-gray-500">Order ID: {id}</p>
      </div>

      {/* Map */}
      <div className="relative h-[500px] rounded-xl overflow-hidden shadow">

        <MapContainer
          center={restaurant}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline positions={[restaurant, customer]} color="orange" />

          <Marker position={position} icon={bikeIcon} />

          <Marker position={customer} />
        </MapContainer>

        {/* Overlay Card */}
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{getStatus()}</p>
              <p className="text-sm text-gray-500">
                Delivery partner is on the way
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold">{eta} min</p>
              <p className="text-xs text-gray-500">ETA</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4 flex justify-between text-xs text-gray-500">
            <span>Picked</span>
            <span>On the way</span>
            <span>Delivered</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrderDetails;