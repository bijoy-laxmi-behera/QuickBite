import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ─── Components ───────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";

// ─── Pages ────────────────────────────────────────────────────────────────────
import Home                 from "./pages/Home";
import Cart                 from "./pages/Cart";
import Checkout             from "./pages/Checkout";
import Favourites           from "./pages/Favourites";
import Orders               from "./pages/Orders";
import OrderSuccess         from "./pages/OrderSuccess";
import OrderTracking        from "./pages/OrderTracking";
import Payments             from "./pages/Payments";
import Profile              from "./pages/Profile";
import Restaurant           from "./pages/Restaurant";
import Reviews              from "./pages/Reviews";
import Addresses            from "./pages/Addresses";
import Notifications        from "./pages/Notifications";
import Categories           from "./pages/Categories";
// ─── Subscription pages ───────────────────────────────────────────────────────
import SubscriptionLanding   from "./pages/SubscriptionLanding";
import SubscriptionCheckout  from "./pages/SubscriptionCheckout";
import SubscriptionSuccess   from "./pages/SubscriptionSuccess";
import SubscriptionDashboard from "./pages/SubscriptionDashboard";

// ─── API ─────────────────────────────────────────────────────────────────────
import API from "../services/axios";

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ─── Shared State ────────────────────────────────────────────────────────────
  const [cart,               setCart]               = useState([]);
  const [favourites,         setFavourites]         = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cartLoading,        setCartLoading]        = useState(true);
  const [favouritesLoading,  setFavouritesLoading]  = useState(true);

  // Derive activePage from URL
  const pathSegments    = location.pathname.split("/").filter(Boolean);
  const relevantSegs    = pathSegments.filter(seg => seg !== "customer");
  const activePage      = relevantSegs[relevantSegs.length - 1] || "home";

  // ─── Fetch Cart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setCartLoading(false); return; }
      try {
        const { data } = await API.get("/customer/me/cart");
        if (data.success) {
          setCart((data.data.items || []).map(item => ({
            id:         item.menuItem?._id || item._id,
            _id:        item.menuItem?._id || item._id,
            name:       item.menuItem?.name,
            price:      item.menuItem?.price,
            qty:        item.quantity,
            quantity:   item.quantity,
            type:       item.menuItem?.isVeg ? "veg" : "non-veg",
            image:      item.menuItem?.image,
            cartItemId: item._id,
          })));
        }
      } catch (e) { console.error("Cart fetch error:", e); }
      finally { setCartLoading(false); }
    };
    fetchCart();
  }, []);

  // ─── Fetch Favourites ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setFavouritesLoading(false); return; }
      try {
        const { data } = await API.get("/customer/me/favourites");
        if (data.success) {
          setFavourites((data.data || []).map(fav => ({
            id:     fav._id || fav.restaurant?._id,
            _id:    fav._id || fav.restaurant?._id,
            name:   fav.name   || fav.restaurant?.name,
            type:   fav.type   || fav.restaurant?.type,
            rating: fav.rating || fav.restaurant?.rating,
            image:  fav.image  || fav.restaurant?.logo,
            items:  fav.items  || fav.restaurant?.items || [],
          })));
        }
      } catch (e) { console.error("Favourites fetch error:", e); }
      finally { setFavouritesLoading(false); }
    };
    fetchFavourites();
  }, []);

  // ─── Listen for cart updates ─────────────────────────────────────────────────
  useEffect(() => {
    const refresh = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const { data } = await API.get("/customer/me/cart");
        if (data.success) {
          setCart((data.data.items || []).map(item => ({
            id:         item.menuItem?._id || item._id,
            _id:        item.menuItem?._id || item._id,
            name:       item.menuItem?.name,
            price:      item.menuItem?.price,
            qty:        item.quantity,
            quantity:   item.quantity,
            type:       item.menuItem?.isVeg ? "veg" : "non-veg",
            image:      item.menuItem?.image,
            cartItemId: item._id,
          })));
        }
      } catch {}
    };
    window.addEventListener("cartUpdated", refresh);
    return () => window.removeEventListener("cartUpdated", refresh);
  }, []);

  // ─── Navigation handler ──────────────────────────────────────────────────────
  const setPage = (page) => {
    if (!page) return;
    if (activePage === page) return;

    const pageMap = {
      home:                  "/customer/home",
      cart:                  "/customer/cart",
      checkout:              "/customer/checkout",
      favourites:            "/customer/favourites",
      orders:                "/customer/orders",
      success:               "/customer/order-success",
      tracking:              `/customer/order-tracking/${localStorage.getItem("trackingOrderId") || ""}`,
      payments:              "/customer/payments",
      profile:               "/customer/profile",
      settings:              "/customer/profile",
      reviews:               "/customer/reviews",
      addresses:             "/customer/addresses",
      notifications:         "/customer/notifications",
      categories:            "/customer/categories",
      // ── Subscription flow ──
      subscriptionLanding:   "/customer/subscription-landing",
      subscriptionCheckout:  "/customer/subscription-checkout",
      subscriptionSuccess:   "/customer/subscription-success",
      subscriptionDashboard: "/customer/subscription-dashboard",
    };

    if (pageMap[page]) {
      navigate(pageMap[page]);
    } else if (page === "restaurant" && selectedRestaurant) {
      navigate(`/customer/restaurant/${selectedRestaurant.id || selectedRestaurant._id}`);
    } else {
      navigate(`/customer/${page}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activePage={activePage} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white shadow-sm shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl text-gray-600">☰</button>
          <span className="font-extrabold text-orange-500 text-lg tracking-tight">QuickBite</span>
        </div>

        {/* Pages */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/customer/home" replace />} />

            <Route path="home" element={
              <Home cart={cart} setCart={setCart}
                    setSelectedRestaurant={setSelectedRestaurant}
                    setFavourites={setFavourites} setPage={setPage} />
            } />

            <Route path="cart" element={
              <Cart cart={cart} setCart={setCart} setPage={setPage} />
            } />

            <Route path="checkout" element={
              <Checkout cart={cart} setCart={setCart} setPage={setPage} />
            } />

            <Route path="favourites" element={
              <Favourites favourites={favourites} setFavourites={setFavourites}
                          setPage={setPage} setSelectedRestaurant={setSelectedRestaurant} />
            } />

            <Route path="orders"                element={<Orders       setPage={setPage} />} />
            <Route path="order-success"         element={<OrderSuccess setPage={setPage} />} />
            <Route path="order-tracking/:orderId" element={<OrderTracking />} />

            <Route path="payments"              element={<Payments />} />
            <Route path="profile"               element={<Profile      setPage={setPage} />} />

            <Route path="restaurant/:restaurantId" element={
              <Restaurant restaurant={selectedRestaurant} setCart={setCart}
                          cart={cart} setPage={setPage} setFavourites={setFavourites} />
            } />

            <Route path="reviews"               element={<Reviews />} />
            <Route path="addresses"             element={<Addresses />} />
            <Route path="notifications"         element={<Notifications />} />
            <Route path="categories"            element={<Categories />} />

            {/* ── Subscription flow ── */}
            <Route path="subscription-landing"   element={<SubscriptionLanding />} />
            <Route path="subscription-checkout"  element={<SubscriptionCheckout />} />
            <Route path="subscription-success"   element={<SubscriptionSuccess />} />
            <Route path="subscription-dashboard" element={<SubscriptionDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/customer/home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;