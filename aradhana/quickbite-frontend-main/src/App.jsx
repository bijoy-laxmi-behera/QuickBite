import { useState } from "react";

/* ================= CUSTOMER ================= */
import CustomerSidebar from "./customer/components/Sidebar";
import Home from "./customer/pages/Home";
import Cart from "./customer/pages/Cart";
import Checkout from "./customer/pages/Checkout";
import OrderTracking from "./customer/pages/OrderTracking";
import OrderSuccess from "./customer/pages/OrderSuccess";
import Restaurant from "./customer/pages/Restaurant";
import SubscriptionCheckout from "./customer/pages/SubscriptionCheckout";
import SubscriptionSuccess from "./customer/pages/SubscriptionSuccess";
import Profile from "./customer/pages/Profile";
import Addresses from "./customer/pages/Addresses";
import Orders from "./customer/pages/Orders";
import Favourites from "./customer/pages/Favourites";
import Payments from "./customer/pages/Payments";
import Reviews from "./customer/pages/Reviews";
import Notifications from "./customer/pages/Notifications";

/* ================= VENDOR ================= */
import VendorSidebar from "./vendor/components/Sidebar";
import Topbar from "./vendor/components/Topbar";
import Dashboard from "./vendor/pages/Dashboard";
import MenuManagement from "./vendor/pages/MenuManagement";
import InventoryBatch from "./vendor/pages/InventoryBatch";
import SubscriptionOrders from "./vendor/pages/SubscriptionOrders";
import Analytics from "./vendor/pages/Analytics";
import SubscriberList from "./vendor/pages/SubscriberList";

const PAGE_LABELS = {
  home: "Home",
  restaurant: "Restaurant",
  cart: "My Cart",
  checkout: "Checkout",
  success: "Order Placed",
  tracking: "Track Order",
  subscriptionCheckout: "Subscribe",
  subscriptionSuccess: "Subscribed!",
  profile: "My Profile",
  addresses: "My Addresses",
  orders: "My Orders",
  favourites: "Favourites",
  payments: "Payments",
  notifications: "Notifications",
  reviews: "My Reviews",
};

function App() {
  // 🔥 SWITCH ROLE HERE — change to "vendor" when needed
  const [role] = useState("customer");

  const [page, setPage] = useState(role === "vendor" ? "dashboard" : "home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [payments, setPayments] = useState([]);

  /* ─────────── CUSTOMER ─────────── */
  if (role === "customer") {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-100">

        {/* SIDEBAR */}
        <CustomerSidebar
          setPage={setPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage={page}
        />

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 md:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN COLUMN */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* TOPBAR */}
          <div className="flex items-center px-4 py-3 bg-white shadow-sm shrink-0 z-10 gap-3 border-b border-gray-100">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-2xl text-gray-600 leading-none"
              aria-label="Open menu"
            >
              ☰
            </button>
            {page !== "home" && (
              <h2 className="font-bold text-gray-700 text-sm sm:text-base">
                {PAGE_LABELS[page] ?? page}
              </h2>
            )}
            {page === "home" && (
              <span className="font-extrabold text-orange-500 text-base md:hidden">QuickBite</span>
            )}
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto">

            {page === "home" && (
              <Home
                setCart={setCart}
                setPage={setPage}
                setSelectedRestaurant={setSelectedRestaurant}
                setFavourites={setFavourites}
              />
            )}

            {page === "restaurant" && (
              <Restaurant
                restaurant={selectedRestaurant}
                setCart={setCart}
                cart={cart}
                setPage={setPage}
                setFavourites={setFavourites}
              />
            )}

            {page === "cart" && (
              <Cart cart={cart} setCart={setCart} setPage={setPage} />
            )}

            {page === "checkout" && (
              <Checkout
                cart={cart}
                setCart={setCart}
                setPage={setPage}
                setPayments={setPayments}
              />
            )}

            {page === "success" && <OrderSuccess setPage={setPage} />}

            {page === "tracking" && <OrderTracking setPage={setPage} />}

            {page === "subscriptionCheckout" && (
              <SubscriptionCheckout setPage={setPage} />
            )}

            {page === "subscriptionSuccess" && (
              <SubscriptionSuccess setPage={setPage} />
            )}

            {/* ✅ setPage passed so Profile menu items navigate correctly */}
            {page === "profile" && (
              <Profile setPage={setPage} />
            )}

            {page === "addresses" && (
              <Addresses setPage={setPage} />
            )}

            {page === "orders" && (
              <Orders setPage={setPage} />
            )}

            {/* ✅ KEY FIX: setSelectedRestaurant + setPage now passed → clicking a fav opens the restaurant */}
            {page === "favourites" && (
              <Favourites
                favourites={favourites}
                setFavourites={setFavourites}
                setPage={setPage}
                setSelectedRestaurant={setSelectedRestaurant}
              />
            )}

            {page === "payments" && (
              <Payments payments={payments} setPayments={setPayments} />
            )}

            {page === "notifications" && <Notifications />}

            {page === "reviews" && <Reviews />}

          </div>

          {/* FOOTER */}
          <div className="text-center text-gray-400 text-xs py-3 bg-white border-t shrink-0">
            © 2026 QuickBite
          </div>

        </div>
      </div>
    );
  }

  /* ─────────── VENDOR ─────────── */
  return (
    <div className="min-h-screen bg-gray-100">
      <VendorSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setPage={setPage}
        activePage={page}
      />
      <div className="lg:ml-64">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <div className="p-4 sm:p-6">
          {page === "dashboard" && <Dashboard />}
          {page === "menu" && <MenuManagement />}
          {page === "inventory" && <InventoryBatch />}
          {page === "orders" && <SubscriptionOrders />}
          {page === "analytics" && <Analytics />}
          {page === "subscribers" && <SubscriberList />}
        </div>
      </div>
    </div>
  );
}

export default App;
