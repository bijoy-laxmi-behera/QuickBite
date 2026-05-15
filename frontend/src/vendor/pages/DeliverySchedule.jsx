// src/vendor/pages/DeliverySchedule.jsx  (Cloud Kitchen only)
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaClock, FaLeaf, FaDrumstickBite, FaMapMarkerAlt, FaSpinner, FaCheckCircle } from "react-icons/fa";

const SLOTS = [
  { key: "lunch",  label: "Lunch",  emoji: "🌤️", time: "12:00 PM – 2:00 PM",  color: "orange" },
  { key: "dinner", label: "Dinner", emoji: "🌙", time: "7:00 PM – 9:00 PM",   color: "blue"   },
];

export default function DeliverySchedule() {
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
  const [slot,    setSlot]    = useState("lunch");
  const [marking, setMarking] = useState(null);
  const [done,    setDone]    = useState(new Set());

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        let data = [];
        try {
          const { data: d } = await API.get("/vendor/subscriptions");
          data = d.data || [];
        } catch {
          const { data: d } = await API.get("/customer/subscription/all");
          data = d.data || [];
        }
        setSubs(Array.isArray(data) ? data.filter(s => s.status === "active") : []);
      } catch { setSubs([]); }
      setLoading(false);
    };
    fetchSubs();
  }, []);

  // Filter by selected slot
  const scheduleList = subs.filter(s => {
    if (slot === "lunch")  return !!s.lunchSlot;
    if (slot === "dinner") return !!s.dinnerSlot;
    return true;
  });

  const slotTime = s => slot === "lunch" ? s.lunchSlot : s.dinnerSlot;

  const markDelivered = (id) => {
    setMarking(id);
    setTimeout(() => {
      setDone(prev => new Set([...prev, id]));
      setMarking(null);
    }, 600);
  };

  const activeSlot = SLOTS.find(s => s.key === slot);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-800">Delivery Schedule</h1>
          <p className="text-gray-400 text-sm">Manage today's meal deliveries</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 transition" />
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Total Today", value: scheduleList.length, bg: "bg-purple-50 border-purple-100", text: "text-purple-600" },
          { label:"Delivered",   value: done.size,           bg: "bg-green-50  border-green-100",  text: "text-green-600"  },
          { label:"Pending",     value: Math.max(0, scheduleList.length - done.size), bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <p className={`text-2xl font-black ${text}`}>{value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Slot tabs */}
      <div className="flex gap-3">
        {SLOTS.map(s => (
          <button key={s.key} onClick={() => setSlot(s.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition border-2 ${
              slot === s.key
                ? s.color === "orange" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-blue-400 bg-blue-50 text-blue-600"
                : "border-gray-100 bg-white text-gray-500"
            }`}>
            <span>{s.emoji}</span>
            {s.label}
            <span className={`text-xs ml-1 ${slot === s.key ? "" : "text-gray-400"}`}>
              ({subs.filter(sub => slot === s.key ? !!sub.lunchSlot : !!sub.dinnerSlot).length})
            </span>
          </button>
        ))}
      </div>

      {/* Time info */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
        activeSlot?.color === "orange" ? "bg-orange-50 border border-orange-100" : "bg-blue-50 border border-blue-100"
      }`}>
        <FaClock className={activeSlot?.color === "orange" ? "text-orange-500" : "text-blue-500"} />
        <div>
          <p className="text-xs text-gray-400 font-medium">{activeSlot?.label} Delivery Window</p>
          <p className="text-sm font-black text-gray-700">{activeSlot?.time}</p>
        </div>
      </div>

      {/* Delivery list */}
      {loading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-purple-500 text-3xl" /></div>
      ) : scheduleList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-4xl">{activeSlot?.emoji}</span>
          <p className="text-gray-400 font-medium mt-3">No {activeSlot?.label} deliveries scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduleList.map((sub, i) => {
            const isDone = done.has(sub._id);
            return (
              <div key={sub._id}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4 transition ${
                  isDone ? "border-green-200 bg-green-50/50" : "border-gray-100"
                }`}>
                {/* Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  isDone ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {isDone ? <FaCheckCircle className="text-sm" /> : i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-800 text-sm">{sub.user?.name || "Customer"}</p>
                    {sub.mealType === "veg"
                      ? <FaLeaf className="text-green-500 text-xs" />
                      : <FaDrumstickBite className="text-red-500 text-xs" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[9px]" />
                      {slotTime(sub) || "—"}
                    </span>
                    {sub.user?.phone && (
                      <span>📞 {sub.user.phone}</span>
                    )}
                  </div>
                  {sub.address && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                      <FaMapMarkerAlt className="text-[9px] flex-shrink-0" />
                      {[sub.address, sub.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                {/* Action */}
                {isDone ? (
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <FaCheckCircle /> Delivered
                  </span>
                ) : (
                  <button
                    onClick={() => markDelivered(sub._id)}
                    disabled={marking === sub._id}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1 flex-shrink-0">
                    {marking === sub._id ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                    Mark Done
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      {scheduleList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-600">Progress</span>
            <span className="font-black text-gray-800">{done.size}/{scheduleList.length} delivered</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${scheduleList.length ? (done.size / scheduleList.length) * 100 : 0}%` }}
            />
          </div>
          {done.size === scheduleList.length && scheduleList.length > 0 && (
            <p className="text-center text-sm font-bold text-green-600 mt-2">🎉 All deliveries completed!</p>
          )}
        </div>
      )}
    </div>
  );
}
