// src/vendor/pages/Subscriptions.jsx  (Cloud Kitchen only)
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaCrown, FaSpinner, FaSearch, FaLeaf, FaDrumstickBite, FaClock, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

export default function Subscriptions() {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [tab,     setTab]     = useState("active");
  const [selected,setSelected]= useState(null);

  useEffect(() => {
    // Fetch subscriptions for this kitchen via vendor endpoint
    const fetchSubs = async () => {
      try {
        const res = await API.get("/vendor/subscriptions");
        const data = res.data?.data || [];
        setSubs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Subscriptions fetch error:", err?.response?.data || err.message);
        setSubs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs(); // ← was missing!
  }, []);

  const filtered = subs.filter(s => {
    const matchTab    = tab === "all" || s.status === tab;
    const matchSearch = !search ||
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    active:    subs.filter(s => s.status === "active").length,
    paused:    subs.filter(s => s.status === "paused").length,
    cancelled: subs.filter(s => s.status === "cancelled").length,
  };

  const nextDelivery = (sub) => {
    const now  = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const parse = (str) => {
      if (!str) return null;
      const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return null;
      let h = parseInt(m[1]);
      if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
      if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
      return h * 60 + parseInt(m[2]);
    };
    const lm = parse(sub.lunchSlot);
    const dm = parse(sub.dinnerSlot);
    if (lm && mins < lm - 30) return `Today Lunch · ${sub.lunchSlot}`;
    if (dm && mins < dm - 30) return `Today Dinner · ${sub.dinnerSlot}`;
    return `Tomorrow Lunch · ${sub.lunchSlot || "—"}`;
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* Left list */}
      <div className="w-full md:w-96 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FaCrown className="text-yellow-500" />
            <h2 className="font-black text-gray-800">Subscribers</h2>
            <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-black px-2.5 py-1 rounded-full">
              {counts.active} active
            </span>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subscriber..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[["active","Active"],["paused","Paused"],["all","All"]].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
                tab === val ? "border-purple-500 text-purple-600" : "border-transparent text-gray-400"
              }`}>
              {label} {val !== "all" && `(${counts[val] || 0})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-purple-500 text-2xl" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FaCrown className="text-gray-200 text-4xl mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No subscribers yet</p>
            </div>
          ) : filtered.map(sub => (
            <div key={sub._id} onClick={() => setSelected(sub)}
              className={`px-4 py-3 cursor-pointer hover:bg-purple-50 transition ${selected?._id === sub._id ? "bg-purple-50 border-l-2 border-purple-500" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-gray-800">{sub.user?.name || "Customer"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub.user?.email || sub.user?.phone || "—"}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                  sub.status === "active"    ? "bg-green-100 text-green-700" :
                  sub.status === "paused"    ? "bg-yellow-100 text-yellow-700" :
                  sub.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {(sub.status || "").toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  {sub.mealType === "veg" ? <FaLeaf className="text-green-500 text-[10px]" /> : <FaDrumstickBite className="text-red-500 text-[10px]" />}
                  {sub.mealType === "veg" ? "Veg" : "Non-Veg"}
                </span>
                <span>·</span>
                <span className="font-semibold text-purple-600 capitalize">{sub.planType}</span>
                <span>· ₹{sub.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: subscriber detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FaCrown className="text-yellow-300 text-5xl mb-3" />
            <h3 className="text-lg font-black text-gray-700">Select a subscriber</h3>
            <p className="text-gray-400 text-sm mt-1">Click any subscriber to see their full details</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-6 space-y-5">

            {/* Profile */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl font-black text-purple-600">
                  {(selected.user?.name || "C")[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="font-black text-gray-800 text-lg">{selected.user?.name || "Customer"}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {selected.user?.phone && <span className="flex items-center gap-1"><FaPhone className="text-[9px]" />{selected.user.phone}</span>}
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      selected.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>{selected.status?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-purple-500">₹{selected.price}</p>
                  <p className="text-xs text-gray-400 capitalize">{selected.planType} plan</p>
                </div>
              </div>
            </div>

            {/* Delivery details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-4">Delivery Details</h3>
              <div className="space-y-3">
                {[
                  { icon:<FaLeaf className="text-green-500" />,            label:"Meal Type",    value: selected.mealType === "veg" ? "🥗 Vegetarian" : "🍗 Non-Vegetarian" },
                  { icon:<FaClock className="text-orange-500" />,           label:"Lunch Slot",   value: selected.lunchSlot  || "—" },
                  { icon:<FaClock className="text-blue-500" />,             label:"Dinner Slot",  value: selected.dinnerSlot || "—" },
                  { icon:<FaMapMarkerAlt className="text-red-500" />,       label:"Address",      value: [selected.address, selected.city, selected.pincode].filter(Boolean).join(", ") || "—" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription period */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-black text-gray-800 mb-4">Subscription Period</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Start Date", selected.startDate ? new Date(selected.startDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"],
                  ["End Date",   selected.endDate   ? new Date(selected.endDate).toLocaleDateString("en-IN",   { day:"2-digit", month:"short", year:"numeric" }) : "—"],
                  ["Days Left",  selected.endDate ? Math.max(0, Math.ceil((new Date(selected.endDate) - new Date()) / 86400000)) + " days" : "—"],
                  ["Next Delivery", selected.status === "active" ? nextDelivery(selected) : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium">{l}</p>
                    <p className="text-sm font-black text-gray-700 mt-1">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next delivery banner */}
            {selected.status === "active" && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 text-white flex items-center gap-3">
                <FaClock className="text-white/80 text-xl flex-shrink-0" />
                <div>
                  <p className="text-white/70 text-xs">Next Delivery</p>
                  <p className="font-black">{nextDelivery(selected)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}