import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ─── Components ───────────────────────────────────────────────────────────────
import Sidebar from "./components/Sidebar";

// ─── Pages ────────────────────────────────────────────────────────────────────
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Favourites from "./pages/Favourites";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import Restaurant from "./pages/Restaurant";
import Reviews from "./pages/Reviews";
import Addresses from "./pages/Addresses";
import Notifications from "./pages/Notifications";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Categories from "./pages/Categories";

// ─── API Import for fetching initial data ─────────────────────────────────────
import API from "../services/axios";

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ─── Shared State for All Pages ─────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [favouritesLoading, setFavouritesLoading] = useState(true);

  // Derive activePage correctly - only take the LAST segment
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const relevantSegments = pathSegments.filter(seg => seg !== "customer");
  const activePage = relevantSegments[relevantSegments.length - 1] || "home";

  // ─── Fetch Cart on Mount ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartLoading(false);
        return;
      }

      try {
        const response = await API.get("/customer/me/cart");
        if (response.data.success) {
          const cartItems = response.data.data.items || [];
          const transformedCart = cartItems.map(item => ({
            id: item.menuItem?._id || item._id,
            _id: item.menuItem?._id || item._id,
            name: item.menuItem?.name,
            price: item.menuItem?.price,
            qty: item.quantity,
            quantity: item.quantity,
            type: item.menuItem?.isVeg ? "veg" : "non-veg",
            image: item.menuItem?.image,
            cartItemId: item._id
          }));
          setCart(transformedCart);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, []);

  // ─── Fetch Favourites on Mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFavouritesLoading(false);
        return;
      }

      try {
        const response = await API.get("/customer/me/favourites");
        if (response.data.success) {
          const favs = response.data.data || [];
          const transformedFavs = favs.map(fav => ({
            id: fav._id || fav.restaurant?._id,
            _id: fav._id || fav.restaurant?._id,
            name: fav.name || fav.restaurant?.name,
            type: fav.type || fav.restaurant?.type,
            rating: fav.rating || fav.restaurant?.rating,
            image: fav.image || fav.restaurant?.logo,
            items: fav.items || fav.restaurant?.items || []
          }));
          setFavourites(transformedFavs);
        }
      } catch (error) {
        console.error("Error fetching favourites:", error);
      } finally {
        setFavouritesLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  // ─── Listen for cart updates from other components ──────────────────────────
  useEffect(() => {
    const handleCartUpdate = () => {
      const refreshCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await API.get("/customer/me/cart");
          if (response.data.success) {
            const cartItems = response.data.data.items || [];
            const transformedCart = cartItems.map(item => ({
              id: item.menuItem?._id || item._id,
              _id: item.menuItem?._id || item._id,
              name: item.menuItem?.name,
              price: item.menuItem?.price,
              qty: item.quantity,
              quantity: item.quantity,
              type: item.menuItem?.isVeg ? "veg" : "non-veg",
              image: item.menuItem?.image,
              cartItemId: item._id
            }));
            setCart(transformedCart);
          }
        } catch (error) {
          console.error("Error refreshing cart:", error);
        }
      };
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Navigation handler
  const setPage = (page) => {
    if (!page) return;
    
    // Don't navigate if already on that page
    if (activePage === page) return;
    
    const pageMap = {
      home: "/customer/home",
      cart: "/customer/cart",
      checkout: "/customer/checkout",
      favourites: "/customer/favourites",
      orders: "/customer/orders",
      success: "/customer/order-success",
      tracking: "/customer/order-tracking",
      payments: "/customer/payments",
      profile: "/customer/profile",      // Profile page
      settings: "/customer/profile",     // Settings also goes to Profile page
      reviews: "/customer/reviews",
      addresses: "/customer/addresses",
      notifications: "/customer/notifications",
      subscriptionCheckout: "/customer/subscription-checkout",
      subscriptionSuccess: "/customer/subscription-success",
      categories: "/customer/categories"
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

      {/* Mobile dark overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (gets activePage for highlighting) ── */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activePage={activePage}
      />

      {/* ── Right side: topbar + scrollable page ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Hamburger topbar — mobile only */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white shadow-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-gray-600"
          >
            ☰
          </button>
          <span className="font-extrabold text-orange-500 text-lg tracking-tight">
            QuickBite
          </span>
        </div>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/customer/home" replace />} />
            
            <Route 
              path="home" 
              element={
                <Home 
                  cart={cart}
                  setCart={setCart}
                  setSelectedRestaurant={setSelectedRestaurant}
                  setFavourites={setFavourites}
                  setPage={setPage}
                />
              } 
            />
            
            <Route 
              path="cart" 
              element={
                <Cart 
                  cart={cart}
                  setCart={setCart}
                  setPage={setPage}
                />
              } 
            />
            
            <Route 
              path="checkout" 
              element={
                <Checkout 
                  cart={cart}
                  setCart={setCart}
                  setPage={setPage}
                />
              } 
            />
            
            <Route 
              path="favourites" 
              element={
                <Favourites 
                  favourites={favourites}
                  setFavourites={setFavourites}
                  setPage={setPage}
                  setSelectedRestaurant={setSelectedRestaurant}
                />
              } 
            />
            
            <Route 
              path="orders" 
              element={<Orders setPage={setPage} />} 
            />
            
            <Route 
              path="order-success" 
              element={<OrderSuccess setPage={setPage} />} 
            />
            
            <Route 
              path="order-tracking/:orderId" 
              element={<OrderTracking setPage={setPage} />} 
            />
            
            <Route 
              path="payments" 
              element={<Payments />} 
            />
            
            <Route 
              path="profile" 
              element={<Profile setPage={setPage} />} 
            />
            
            <Route 
              path="restaurant/:restaurantId" 
              element={
                <Restaurant 
                  restaurant={selectedRestaurant}
                  setCart={setCart}
                  cart={cart}
                  setPage={setPage}
                  setFavourites={setFavourites}
                />
              } 
            />
            
            <Route 
              path="reviews" 
              element={<Reviews />} 
            />
            
            <Route 
              path="addresses" 
              element={<Addresses />} 
            />
            
            <Route 
              path="notifications" 
              element={<Notifications />} 
            />
            
            <Route 
              path="subscription-checkout" 
              element={<SubscriptionCheckout setPage={setPage} />} 
            />
            
            <Route 
              path="categories" 
              element={<Categories />} 
            />
            
            <Route 
              path="subscription-success" 
              element={<SubscriptionSuccess setPage={setPage} />} 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;