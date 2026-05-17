// src/customer/pages/SubscriptionDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/axios";
import {
  FaStar, FaClock, FaLeaf, FaDrumstickBite, FaMapMarkerAlt,
  FaPhone, FaPause, FaTimes, FaSpinner, FaCheckCircle,
  FaCalendarAlt, FaTruck, FaSun, FaMoon,
} from "react-icons/fa";
import { MdRestaurant } from "react-icons/md";

function InfoRow({ icon, label, value, valueClass = "text-gray-700" }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2 text-gray-400 flex-shrink-0">
        {icon}<span className="text-xs font-medium">{label}</span>
      </div>
      <span className={`text-sm font-semibold text-right ${valueClass}`}>{value || "—"}</span>
    </div>
  );
}

// ── Subscription Menu Component ───────────────────────────────────────────────
function SubscriptionMenu({ menu, menuLoading, mealType }) {
  const [slot, setSlot] = useState("lunch");
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const slotItems = menu.filter(item => {
    const itemSlot = item.mealSlot || "lunch";
    const matchSlot = itemSlot === slot || itemSlot === "both";
    const matchMeal = mealType === "non-veg" || item.isveg !== false;
    const matchDay  = !item.dayOfWeek || item.dayOfWeek === "daily" || item.dayOfWeek === today;
    return matchSlot && matchMeal && matchDay;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-800">Today's Menu</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {today}'s meals · {mealType === "veg" ? "🥗 Vegetarian" : "🍗 All items"}
          </p>
        </div>
        {menu.length > 0 && (
          <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2.5 py-1 rounded-full">
            {slotItems.length} items
          </span>
        )}
      </div>

      {/* Slot tabs */}
      {menu.length > 0 && (
        <div className="flex border-b border-gray-50">
          {[
            { val:"lunch",  emoji:"🌤️", label:"Lunch",  count: menu.filter(i=>(i.mealSlot||"lunch")==="lunch"||(i.mealSlot||"lunch")==="both").length },
            { val:"dinner", emoji:"🌙", label:"Dinner", count: menu.filter(i=>(i.mealSlot||"lunch")==="dinner"||(i.mealSlot||"lunch")==="both").length },
          ].map(s => (
            <button key={s.val} onClick={() => setSlot(s.val)}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
                slot === s.val
                  ? s.val === "lunch" ? "border-orange-500 text-orange-600 bg-orange-50/50" : "border-blue-500 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-400"
              }`}>
              {s.emoji} {s.label}
              <span className="text-xs opacity-60">({s.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Info bar */}
      {menu.length > 0 && (
        <div className={`px-5 py-2 text-xs font-medium flex items-center gap-2 ${
          slot === "lunch" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
        }`}>
          <span>{slot === "lunch" ? "🌤️" : "🌙"}</span>
          {today}'s {slot} menu{mealType === "veg" ? " · Veg items only" : ""}
        </div>
      )}

      {/* Items */}
      {menuLoading ? (
        <div className="flex items-center justify-center py-10 gap-2">
          <FaSpinner className="animate-spin text-orange-500" />
          <span className="text-sm text-gray-400">Loading menu...</span>
        </div>
      ) : slotItems.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-3xl">{slot === "lunch" ? "🌤️" : "🌙"}</span>
          <p className="text-gray-400 text-sm font-medium mt-2">
            No {slot} items for today
          </p>
          <p className="text-gray-300 text-xs mt-1">Check back later or switch slots</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slotItems.map(item => (
            <div key={item._id}
              className="flex gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"}
                  alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-3.5 h-3.5 rounded-sm border-2 flex-shrink-0 flex items-center justify-center ${
                    item.isveg !== false ? "border-green-600" : "border-red-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isveg !== false ? "bg-green-600" : "bg-red-600"}`} />
                  </span>
                  <h4 className="text-sm font-bold text-gray-800 truncate">{item.name}</h4>
                </div>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {item.dayOfWeek && item.dayOfWeek !== "daily" && (
                    <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-semibold">
                      {item.dayOfWeek} special
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function SubscriptionDashboard() {
  const navigate = useNavigate();
  const [sub,        setSub]        = useState(null);
  const [kitchen,    setKitchen]    = useState(null);
  const [menu,       setMenu]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [menuLoading,setMenuLoading]= useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pausing,    setPausing]    = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Fetch subscription status
        const { data } = await API.get("/customer/subscription/status");
        if (data.success && data.data) {
          setSub(data.data);

          // 2. Fetch kitchen details
          const kitchenId = data.data.kitchenId?._id || data.data.kitchenId;
          if (kitchenId) {
            try {
              const { data: kData } = await API.get(`/customer/restaurants/${kitchenId}`);
              setKitchen(kData.data || kData);
            } catch {
              // Try sessionStorage fallback
              try {
                const k = JSON.parse(sessionStorage.getItem("subKitchen") || "null");
                if (k) setKitchen(k);
              } catch {}
            }

            // 3. Fetch menu
            setMenuLoading(true);
            try {
              const { data: mData } = await API.get(`/customer/restaurants/${kitchenId}/menu`);
              const raw = mData.data || mData.items || mData || [];
              const items = Array.isArray(raw) ? raw : Object.values(raw).flat();
              setMenu(items);
            } catch { setMenu([]); }
            setMenuLoading(false);
          }
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Fallbacks from sessionStorage
  let sessionDetails = null;
  try { sessionDetails = JSON.parse(sessionStorage.getItem("subDetails") || "null"); } catch {}
  const plan       = sub?.planType   || sessionDetails?.plan    || "weekly";
  const mealType   = sub?.mealType   || sessionDetails?.mealType || "veg";
  const lunchSlot  = sub?.lunchSlot  || sessionDetails?.lunchSlot  || "—";
  const dinnerSlot = sub?.dinnerSlot || sessionDetails?.dinnerSlot || "—";
  const price      = sub?.price      || sessionDetails?.price   || (plan === "weekly" ? 699 : 2499);
  const address    = sub?.address    || sessionDetails?.address || "";
  const planLabel  = plan === "weekly" ? "Weekly" : "Monthly";
  const daysLeft   = sub?.endDate ? Math.max(0, Math.ceil((new Date(sub.endDate) - new Date()) / 86400000)) : (plan === "weekly" ? 7 : 30);
  const startDate  = sub?.startDate ? new Date(sub.startDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "Today";
  const endDate    = sub?.endDate   ? new Date(sub.endDate).toLocaleDateString("en-IN",   { day:"2-digit", month:"short", year:"numeric" }) : "—";
  const progress   = sub?.endDate && sub?.startDate
    ? Math.max(5, Math.min(100, 100 - (daysLeft / (plan === "weekly" ? 7 : 30)) * 100))
    : 10;

  const getNextDelivery = () => {
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const parse = (str) => {
      if (!str || str === "—") return null;
      const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return null;
      let h = parseInt(m[1]);
      if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
      if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
      return h * 60 + parseInt(m[2]);
    };
    const lm = parse(lunchSlot), dm = parse(dinnerSlot);
    if (lm && nowMins < lm - 30) return { label:`Today Lunch · ${lunchSlot}`,   color:"text-green-600"  };
    if (dm && nowMins < dm - 30) return { label:`Today Dinner · ${dinnerSlot}`,  color:"text-blue-600"   };
    return                               { label:`Tomorrow Lunch · ${lunchSlot}`, color:"text-orange-500" };
  };
  const nextDelivery = getNextDelivery();

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription?")) return;
    setCancelling(true);
    try {
      await API.post("/customer/subscription/cancel");
      localStorage.removeItem("hasSubscription");
      sessionStorage.removeItem("subKitchen");
      sessionStorage.removeItem("subDetails");
      navigate("/customer/home");
    } catch (e) { alert(e.response?.data?.message || "Failed to cancel"); }
    setCancelling(false);
  };

  const handlePause = async () => {
    const isPaused = sub?.status === "paused";
    if (!window.confirm(isPaused ? "Resume your subscription?" : "Pause your subscription?")) return;
    setPausing(true);
    try {
      const { data } = await API.post("/customer/subscription/pause");
      if (data.success) {
        setSub(prev => ({ ...prev, status: data.data.status }));
        alert(data.message);
      }
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update subscription");
    }
    setPausing(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <FaSpinner className="animate-spin text-orange-500 text-3xl" />
      <p className="text-gray-400 text-sm">Loading your subscription…</p>
    </div>
  );

  if (!sub && !sessionDetails) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <MdRestaurant className="text-5xl text-gray-300 mb-4" />
      <h2 className="text-xl font-black text-gray-700 mb-2">No Active Subscription</h2>
      <p className="text-gray-400 text-sm mb-6">You don't have an active meal subscription yet.</p>
      <button onClick={() => navigate("/customer/subscription-landing")}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-2xl transition shadow-lg">
        Start Subscribing
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Header banner */}
      <div className={`px-6 pt-8 pb-16 bg-gradient-to-br ${
        sub?.status === "paused" ? "from-gray-600 to-gray-500" : "from-orange-600 to-amber-500"
      }`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            {sub?.status === "paused"
              ? <><FaPause className="text-white text-sm" /><span className="text-white/80 text-xs font-bold tracking-widest uppercase">Subscription Paused</span></>
              : <><FaCheckCircle className="text-white text-sm" /><span className="text-white/80 text-xs font-bold tracking-widest uppercase">Active Subscription</span></>
            }
          </div>
          <h1 className="text-2xl font-black text-white mb-1">{planLabel} Meal Plan</h1>
          <p className="text-white/75 text-sm">₹{price}/{plan === "weekly" ? "wk" : "mo"} · {mealType === "veg" ? "Vegetarian 🥗" : "Non-Vegetarian 🍗"}</p>
          <div className="mt-5">
            <div className="flex justify-between text-white/80 text-xs mb-1.5">
              <span>Started {startDate}</span>
              <span>{daysLeft} days left · Ends {endDate}</span>
            </div>
            <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width:`${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">

        {/* Kitchen card */}
        {kitchen ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="relative h-44 overflow-hidden">
              <img src={kitchen.image || kitchen.logo || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80"}
                alt={kitchen.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] bg-purple-500 text-white font-bold px-2 py-0.5 rounded-full">Cloud Kitchen</span>
                  <h2 className="text-white font-black text-xl mt-1 leading-tight">{kitchen.name}</h2>
                  <p className="text-white/70 text-xs">
                    {Array.isArray(kitchen.cuisine) ? kitchen.cuisine.join(", ") : kitchen.cuisine || "Multi-Cuisine"}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded-xl">
                  <FaStar className="text-yellow-400 text-[10px]" />
                  {kitchen.rating || "4.5"}
                </div>
              </div>
            </div>

            {kitchen.description && (
              <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
                <p className="text-xs text-gray-600 leading-relaxed">{kitchen.description}</p>
              </div>
            )}

            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { icon:<FaClock className="text-orange-500 text-xs" />, label:`${kitchen.deliveryTime || 30} min delivery` },
                { icon:<FaStar  className="text-yellow-400 text-xs" />, label:`${kitchen.rating || "4.5"} rating` },
                kitchen.phone && { icon:<FaPhone className="text-blue-500 text-xs" />, label:kitchen.phone },
                (kitchen.address?.city || kitchen.location?.city) && {
                  icon:<FaMapMarkerAlt className="text-red-500 text-xs" />,
                  label: kitchen.address?.city || kitchen.location?.city
                },
              ].filter(Boolean).map(({ icon, label }, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  {icon}
                  <span className="text-xs text-gray-600 font-medium truncate">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-sm flex items-center gap-3">
            <FaSpinner className="animate-spin text-orange-400 flex-shrink-0" />
            <p className="text-sm text-gray-500">Loading kitchen details…</p>
          </div>
        )}

        {/* Today's menu */}
        <SubscriptionMenu menu={menu} menuLoading={menuLoading} mealType={mealType} />

        {/* Subscription details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">Your Plan Details</p>
          <InfoRow icon={<FaCalendarAlt size={12} />}
            label="Plan" value={`${planLabel} · ${plan === "weekly" ? "7 days" : "30 days"}`} />
          <InfoRow
            icon={mealType === "veg" ? <FaLeaf size={12} className="text-green-500" /> : <FaDrumstickBite size={12} className="text-red-500" />}
            label="Meal Type" value={mealType === "veg" ? "🥗 Vegetarian" : "🍗 Non-Vegetarian"} />
          <InfoRow icon={<FaSun  size={12} className="text-orange-500" />} label="Lunch Slot"  value={lunchSlot}  />
          <InfoRow icon={<FaMoon size={12} className="text-blue-500"   />} label="Dinner Slot" value={dinnerSlot} />
          {address && <InfoRow icon={<FaMapMarkerAlt size={12} />} label="Address" value={address} />}
          <InfoRow icon={<FaTruck size={12} />}
            label="Next Delivery" value={nextDelivery.label} valueClass={`font-bold ${nextDelivery.color}`} />
          <InfoRow icon={<FaCalendarAlt size={12} />}
            label="Amount Paid" value={`₹${price}`} valueClass="text-gray-800 font-black" />
        </div>

        {/* What to expect */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">What to Expect</p>
          <div className="space-y-3">
            {[
              { icon:"🍽️", title:"Fresh Meals Daily",   desc:"Your kitchen prepares fresh food every day — no reheated meals." },
              { icon:"🚚", title:"On-Time Delivery",     desc:`Lunch: ${lunchSlot} · Dinner: ${dinnerSlot}` },
              { icon:"📱", title:"Track Your Order",     desc:"You'll receive a notification when your meal is dispatched." },
              { icon:"⏸️", title:"Pause or Cancel",      desc:"Manage your subscription anytime from this page." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handlePause} disabled={pausing}
            className="flex items-center justify-center gap-2 py-3.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl font-bold text-sm hover:bg-yellow-100 transition disabled:opacity-50">
            {pausing ? <FaSpinner className="animate-spin" /> : <FaPause />}
            {sub?.status === "paused" ? "Resume Plan" : "Pause Plan"}
          </button>
          <button onClick={handleCancel} disabled={cancelling}
            className="flex items-center justify-center gap-2 py-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition disabled:opacity-50">
            {cancelling ? <FaSpinner className="animate-spin" /> : <FaTimes />} Cancel Plan
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Need help?{" "}
          <span className="text-orange-500 font-semibold cursor-pointer"
            onClick={() => navigate("/customer/notifications")}>
            Contact Support
          </span>
        </p>
      </div>
    </div>
  );
}