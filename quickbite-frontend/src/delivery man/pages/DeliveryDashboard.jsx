import { useDelivery } from "../context/DeliveryContext";
import EarningsCard from "../components/EarningsCard";

const DeliveryDashboard = () => {
  const { online, setOnline } = useDelivery();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Delivery Dashboard</h1>

        <button
          onClick={() => setOnline(!online)}
          className={`px-5 py-2 rounded-lg text-white ${
            online ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          {online ? "Online" : "Offline"}
        </button>
      </div>

      {/* Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EarningsCard amount={500} label="Today Earnings" />
        <EarningsCard amount={3500} label="This Week" />
        <EarningsCard amount={12000} label="This Month" />
      </div>

    </div>
  );
};

export default DeliveryDashboard;