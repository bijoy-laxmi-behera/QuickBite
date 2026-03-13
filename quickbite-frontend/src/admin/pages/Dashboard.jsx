import { useState } from "react";
import Sidebar from "./Sidebar";
import Analytics from "./Analytics";
import UserManagement from "./UserManagement";
import OrderManagement from "./OrderManagement";
import VendorManagement from "./VendorManagement";
import MealPlanManagement from "./MealPlanManagement";
import DeliveryManagement from "./DeliveryManagement";
import FeedbackReviews from "./FeedbackReviews";

const sectionTitles = {
  analytics: "Analytics",
  users: "User Management",
  orders: "Order Management",
  vendors: "Vendor Management",
  mealplans: "Meal Plan Management",
  delivery: "Delivery Management",
  feedback: "Feedback & Reviews",
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("analytics");

  const renderSection = () => {
    switch (activeSection) {
      case "analytics": return <Analytics />;
      case "users": return <UserManagement />;
      case "orders": return <OrderManagement />;
      case "vendors": return <VendorManagement />;
      case "mealplans": return <MealPlanManagement />;
      case "delivery": return <DeliveryManagement />;
      case "feedback": return <FeedbackReviews />;
      default: return <Analytics />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <Sidebar active={activeSection} onNavigate={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-800">{sectionTitles[activeSection]}</h1>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-orange-50 transition-colors">
              <span className="text-lg">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
            </button>
            {/* Avatar */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">A</div>
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
