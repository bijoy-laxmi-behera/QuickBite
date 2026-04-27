import DeliverySidebar from "../components/DeliverySidebar";
import Navbar from "../components/Navbar";

const Earnings = () => {
  return (
    <div className="space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold">Earnings</h1>

      {/* Earnings Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500 text-sm">Total Earnings</p>
        <h2 className="text-3xl font-bold text-green-600">₹15,000</h2>
      </div>

    </div>
  );
};

export default Earnings;