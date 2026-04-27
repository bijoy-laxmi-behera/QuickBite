import Navbar from "../components/Navbar";
import Recommended from "../components/Recommended";
import SubscriptionSection from "../components/SubscriptionSection";

function CustomerDashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <SubscriptionSection />
        <Recommended />
      </div>

    </div>
  );
}

export default CustomerDashboard;