import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function CustomerLayout() {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">
            Welcome 👋
          </h1>

          <div className="flex items-center gap-6 text-sm">
            <span className="cursor-pointer hover:text-orange-500">Orders</span>
            <span className="cursor-pointer hover:text-orange-500">Cart</span>
            <span className="cursor-pointer text-red-500">Logout</span>
          </div>
        </div>

        {/* Page */}
        <div className="p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default CustomerLayout;