import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Dashboard from "./Dashboard";
import MenuManagement from "./MenuManagement";
import InventoryBatch from "./InventoryBatch";
import SubscriptionOrders from "./SubscriptionOrders";
import Analytics from "./Analytics";
import SubscriberList from "./SubscriberList";

function VendorLayout() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <Dashboard />;
      case "menu":        return <MenuManagement />;
      case "inventory":   return <InventoryBatch />;
      case "orders":      return <SubscriptionOrders />;
      case "analytics":   return <Analytics />;
      case "subscribers": return <SubscriberList />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setPage={setPage}
        activePage={page}
      />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default VendorLayout;