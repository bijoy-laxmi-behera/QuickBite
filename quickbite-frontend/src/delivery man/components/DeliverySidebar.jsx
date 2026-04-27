import { Link } from "react-router-dom";

const DeliverySidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-6">Delivery Panel</h2>

      <ul className="space-y-4">
        <li><Link to="/delivery/dashboard">Dashboard</Link></li>
        <li><Link to="/delivery/orders">Orders</Link></li>
        <li><Link to="/delivery/earnings">Earnings</Link></li>
        <li><Link to="/delivery/profile">Profile</Link></li>
      </ul>
    </div>
  );
};

export default DeliverySidebar;