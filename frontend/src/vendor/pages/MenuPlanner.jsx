// src/vendor/pages/MenuPlanner.jsx  (Cloud Kitchen only)
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaSpinner, FaSave, FaSun, FaMoon, FaPlus, FaTimes } from "react-icons/fa";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function MenuPlanner() {
  const [menuItems, setMenuItems]   = useState([]);
  const [plan,      setPlan]        = useState({});  // { Monday: { lunch:[], dinner:[] }, ... }
  const [loading,   setLoading]     = useState(true);
  const [saving,    setSaving]      = useState(false);
  const [selDay,    setSelDay]      = useState("Monday");
  const [addSlot,   setAddSlot]     = useState(null); // "lunch" | "dinner"
  const [search,    setSearch]      = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [m, p] = await Promise.allSettled([
          API.get("/vendor/menu"),
          API.get("/vendor/menu-plan"),
        ]);
        if (m.status === "fulfilled") {
          const raw = m.value.data.data || m.value.data.items || m.value.data;
          setMenuItems(Array.isArray(raw) ? raw : Object.values(raw).flat());
        }
        if (p.status === "fulfilled" && p.value.data.data) {
          setPlan(p.value.data.data);
        } else {
          // Initialize empty plan
          const empty = {};
          DAYS.forEach(d => { empty[d] = { lunch: [], dinner: [] }; });
          setPlan(empty);
        }
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const savePlan = async () => {
    setSaving(true);
    try {
      await API.post("/vendor/menu-plan", { plan });
      alert("Menu plan saved!");
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  const addItem = (itemId) => {
    if (!addSlot) return;
    setPlan(prev => {
      const day = prev[selDay] || { lunch:[], dinner:[] };
      if (day[addSlot].includes(itemId)) return prev; // already added
      return { ...prev, [selDay]: { ...day, [addSlot]: [...day[addSlot], itemId] } };
    });
    setSearch("");
  };

  const removeItem = (day, slot, itemId) => {
    setPlan(prev => {
      const d = prev[day] || { lunch:[], dinner:[] };
      return { ...prev, [day]: { ...d, [slot]: d[slot].filter(id => id !== itemId) } };
    });
  };

  const getItem = (id) => menuItems.find(i => i._id === id || i._id?.toString() === id?.toString());

  const filteredItems = menuItems.filter(i => {
    const matchSearch = !search || i.name?.toLowerCase().includes(search.toLowerCase());
    // Only show items relevant to the current slot
    const itemSlot = i.mealSlot || "lunch";
    const matchSlot = itemSlot === addSlot || itemSlot === "both";
    return matchSearch && matchSlot;
  });

  const dayPlan = plan[selDay] || { lunch:[], dinner:[] };

  if (loading) return (
    <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-purple-500 text-3xl" /></div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-800">Weekly Menu Planner</h1>
          <p className="text-gray-400 text-sm">Plan what meals subscribers receive each day</p>
        </div>
        <button onClick={savePlan} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-purple-200 disabled:opacity-50">
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Save Plan
        </button>
      </div>

      {/* Week overview strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Week Overview</p>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map(day => {
            const d = plan[day] || { lunch:[], dinner:[] };
            const total = d.lunch.length + d.dinner.length;
            return (
              <button key={day} onClick={() => setSelDay(day)}
                className={`flex flex-col items-center py-2.5 rounded-xl transition ${
                  selDay === day ? "bg-purple-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}>
                <p className="text-xs font-black">{day.slice(0,3)}</p>
                <div className="flex gap-1 mt-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    selDay===day?"bg-white/20 text-white":"bg-orange-100 text-orange-600"
                  }`}>{d.lunch.length}L</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    selDay===day?"bg-white/20 text-white":"bg-blue-100 text-blue-600"
                  }`}>{d.dinner.length}D</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Lunch */}
        {["lunch","dinner"].map(slot => (
          <div key={slot} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={`px-5 py-4 flex items-center justify-between ${
              slot==="lunch" ? "bg-orange-50 border-b border-orange-100" : "bg-blue-50 border-b border-blue-100"
            }`}>
              <div className="flex items-center gap-2">
                {slot==="lunch" ? <FaSun className="text-orange-500" /> : <FaMoon className="text-blue-500" />}
                <h3 className={`font-black text-sm ${slot==="lunch"?"text-orange-700":"text-blue-700"}`}>
                  {selDay} {slot==="lunch"?"Lunch":"Dinner"}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  slot==="lunch"?"bg-orange-200 text-orange-700":"bg-blue-200 text-blue-700"
                }`}>{dayPlan[slot]?.length || 0} items</span>
              </div>
              <button onClick={() => setAddSlot(addSlot===slot?null:slot)}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  addSlot===slot
                    ? "bg-red-100 text-red-600"
                    : slot==="lunch" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                }`}>
                {addSlot===slot ? <><FaTimes /> Cancel</> : <><FaPlus /> Add</>}
              </button>
            </div>

            {/* Item picker */}
            {addSlot === slot && (
              <div className="p-3 border-b border-gray-50 bg-gray-50">
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search menu items..."
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition mb-2" />
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {filteredItems.filter(i => !(dayPlan[slot]||[]).includes(i._id)).map(item => (
                    <button key={item._id} onClick={() => addItem(item._id)}
                      className="w-full flex items-center gap-3 px-3 py-2 bg-white rounded-xl hover:bg-orange-50 hover:border-orange-200 border border-gray-100 transition text-left">
                      <span className={`w-3 h-3 border-2 rounded-sm flex-shrink-0 flex items-center justify-center ${
                        item.isveg!==false?"border-green-600":"border-red-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isveg!==false?"bg-green-600":"bg-red-600"}`} />
                      </span>
                      <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{item.name}</span>
                      <span className="text-xs text-orange-500 font-bold">₹{item.price}</span>
                    </button>
                  ))}
                  {filteredItems.filter(i => !(dayPlan[slot]||[]).includes(i._id)).length === 0 && (
                    <p className="text-center text-xs text-gray-400 py-3">All items added or no items found</p>
                  )}
                </div>
              </div>
            )}

            {/* Added items */}
            <div className="p-3 space-y-2 min-h-[80px]">
              {(dayPlan[slot] || []).length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-300 text-2xl">{slot==="lunch"?"🌤️":"🌙"}</p>
                  <p className="text-xs text-gray-400 mt-1">No {slot} items planned for {selDay}</p>
                </div>
              ) : (
                (dayPlan[slot] || []).map(itemId => {
                  const item = getItem(itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                      <span className={`w-3 h-3 border-2 rounded-sm flex-shrink-0 ${
                        item.isveg!==false?"border-green-600":"border-red-600"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">₹{item.price}</p>
                      </div>
                      <button onClick={() => removeItem(selDay, slot, itemId)}
                        className="text-gray-300 hover:text-red-500 transition">
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Copy from day */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Quick Copy</p>
        <div className="flex flex-wrap gap-2 items-center">
          <p className="text-sm text-gray-600">Copy {selDay}'s plan to:</p>
          {DAYS.filter(d => d !== selDay).map(day => (
            <button key={day} onClick={() => {
              setPlan(prev => ({ ...prev, [day]: { ...prev[selDay] } }));
              alert(`Copied to ${day}!`);
            }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-600 text-xs font-bold rounded-xl transition">
              {day.slice(0,3)}
            </button>
          ))}
          <button onClick={() => {
            const copy = {};
            DAYS.filter(d=>d!==selDay).forEach(d => { copy[d] = { ...plan[selDay] }; });
            setPlan(prev => ({ ...prev, ...copy }));
            alert("Copied to all days!");
          }}
            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-xl transition">
            All Days
          </button>
        </div>
      </div>
    </div>
  );
}