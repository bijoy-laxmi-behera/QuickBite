import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardPage from "./Dashboard";
import ActiveDelivery from "./ActiveDelivery";
import DeliveryHistory from "./DeliveryHistory";
import Earnings from "./Earnings";
import Profile from "./Profile";

export default function DeliveryLayout() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage setPage={setPage} />;
      case "active":    return <ActiveDelivery />;
      case "history":   return <DeliveryHistory />;
      case "earnings":  return <Earnings />;
      case "profile":   return <Profile />;
      default:          return <DashboardPage setPage={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar page={page} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
