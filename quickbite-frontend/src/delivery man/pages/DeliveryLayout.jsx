import { Outlet } from "react-router-dom";
import DeliverySidebar from "../components/DeliverySidebar";
import Navbar from "../components/Navbar";

const DeliveryLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <DeliverySidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default DeliveryLayout;