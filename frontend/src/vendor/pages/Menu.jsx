// src/vendor/pages/Menu.jsx  — Smart Menu: Cloud Kitchen vs Restaurant
import { useState, useEffect, useRef } from "react";
import API from "../../services/axios";
import {
  FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
  FaSpinner, FaTimes, FaLeaf, FaDrumstickBite,
  FaSun, FaMoon, FaCalendarAlt, FaUtensils,
} from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────────────────
// DAYS for weekly rotation
// ─────────────────────────────────────────────────────────────────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ─────────────────────────────────────────────────────────────────────────────
// Shared item modal (used by both modes)
// ─────────────────────────────────────────────────────────────────────────────
function ItemModal({ item, categories, isCloudKitchen, defaultSlot, onClose, onSave }) {
  const [form, setForm] = useState(item
    ? {
        name:         item.name         || "",
        description:  item.description  || "",
        price:        item.price        || "",
        category:     item.category?._id || item.category || "",
        isVeg:        item.isVeg !== false,
        isAvailable:  item.isAvailable  !== false,
        mealSlot:     item.mealSlot     || defaultSlot || "lunch",
        dayOfWeek:    item.dayOfWeek    || "daily",
        image:        null,
      }
    : {
        name:"", description:"", price:"", category:"",
        isVeg:true, isAvailable:true,
        mealSlot: defaultSlot || "lunch",
        dayOfWeek:"daily", image:null,
      }
  );
  const [preview, setPreview] = useState(item?.image || null);
  const [saving,  setSaving]  = useState(false);
  const fileRef = useRef();

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    f("image", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) { alert("Name and price required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "image" && v instanceof File) fd.append("image", v);
        else if (k !== "image") fd.append(k, v);
      });
      if (item?._id) await API.put(`/vendor/menu/${item._id}`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      else           await API.post("/vendor/menu",             fd, { headers:{"Content-Type":"multipart/form-data"} });
      onSave();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-800">{item ? "Edit Item" : "Add Menu Item"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">

          {/* Image upload */}
          <div onClick={() => fileRef.current?.click()}
            className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-orange-400 transition bg-gray-50">
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover" />
              : <div className="text-center"><p className="text-2xl">📸</p><p className="text-xs text-gray-400 mt-1">Click to upload photo</p></div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {/* Name */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Item Name *</label>
            <input value={form.name} onChange={e => f("name", e.target.value)}
              placeholder="e.g. Dal Tadka with Rice"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
          </div>

          {/* Cloud Kitchen: Meal Slot + Day */}
          {isCloudKitchen && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Meal Slot</label>
                  <select value={form.mealSlot} onChange={e => f("mealSlot", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition bg-white">
                    <option value="lunch">🌤️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="both">🌤️🌙 Both</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Day</label>
                  <select value={form.dayOfWeek} onChange={e => f("dayOfWeek", e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition bg-white">
                    <option value="daily">Every Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className={`text-xs font-medium px-3 py-2 rounded-xl ${
                form.mealSlot === "lunch" ? "bg-orange-50 text-orange-600" :
                form.mealSlot === "dinner"? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
              }`}>
                This item will appear in subscribers' {form.mealSlot === "both" ? "Lunch & Dinner" : form.mealSlot} menu
                {form.dayOfWeek !== "daily" ? ` on ${form.dayOfWeek}s` : " every day"}.
              </div>
            </>
          )}

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => f("price", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e => f("category", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition bg-white">
                <option value="">No category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Description</label>
            <textarea rows={2} value={form.description} onChange={e => f("description", e.target.value)}
              placeholder="Brief description of this dish..."
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
          </div>

          {/* Veg / Non-veg */}
          <div className="grid grid-cols-2 gap-2">
            {[{v:true,l:"Vegetarian",icon:<FaLeaf />,cls:"border-green-400 bg-green-50 text-green-700"},
              {v:false,l:"Non-Veg",icon:<FaDrumstickBite />,cls:"border-red-400 bg-red-50 text-red-700"}].map(opt => (
              <button key={String(opt.v)} onClick={() => f("isVeg", opt.v)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                  form.isVeg === opt.v ? opt.cls : "border-gray-100 bg-gray-50 text-gray-400"
                }`}>
                {opt.icon} {opt.l}
              </button>
            ))}
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Available Today</span>
            <button onClick={() => f("isAvailable", !form.isAvailable)}>
              {form.isAvailable
                ? <FaToggleOn  className="text-green-500 text-2xl" />
                : <FaToggleOff className="text-gray-400 text-2xl" />}
            </button>
          </div>

          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <FaSpinner className="animate-spin" />}
            {item ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD KITCHEN MENU — Lunch/Dinner split with weekly schedule
// ─────────────────────────────────────────────────────────────────────────────
function CloudKitchenMenu({ menu, categories, onAdd, onEdit, onDelete, onToggle, fetchAll }) {
  const [slot,    setSlot]    = useState("lunch");  // "lunch" | "dinner"
  const [view,    setView]    = useState("daily");  // "daily" | "weekly"
  const [selDay,  setSelDay]  = useState("Monday");

  // Filter items by slot
  const slotItems = menu.filter(item => {
    const s = item.mealSlot || "lunch";
    return s === slot || s === "both";
  });

  // For weekly view: further filter by day
  const dayItems = view === "weekly"
    ? slotItems.filter(i => i.dayOfWeek === selDay || i.dayOfWeek === "daily")
    : slotItems;

  return (
    <div className="space-y-4">

      {/* Slot + View toggle */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Lunch / Dinner tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {[
            { val:"lunch",  icon:<FaSun  className="text-orange-500" />, label:"Lunch"  },
            { val:"dinner", icon:<FaMoon className="text-blue-500"   />, label:"Dinner" },
          ].map(s => (
            <button key={s.val} onClick={() => setSlot(s.val)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition ${
                slot === s.val ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}>
              {s.icon} {s.label}
              <span className="text-[10px] opacity-60">
                ({menu.filter(i => (i.mealSlot||"lunch")===s.val||(i.mealSlot||"lunch")==="both").length})
              </span>
            </button>
          ))}
        </div>

        {/* Daily / Weekly */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 ml-auto">
          {[
            { val:"daily",  icon:<FaUtensils   />, label:"Daily Menu"    },
            { val:"weekly", icon:<FaCalendarAlt />, label:"Weekly Rotation" },
          ].map(v => (
            <button key={v.val} onClick={() => setView(v.val)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                view === v.val ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly day selector */}
      {view === "weekly" && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DAYS.map(day => (
            <button key={day} onClick={() => setSelDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex-shrink-0 transition ${
                selDay === day
                  ? slot === "lunch" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              {day.slice(0,3)}
              <span className="ml-1 opacity-60 text-[9px]">
                ({slotItems.filter(i => i.dayOfWeek===day||i.dayOfWeek==="daily").length})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className={`rounded-xl px-4 py-3 text-sm flex items-start gap-3 ${
        slot === "lunch" ? "bg-orange-50 border border-orange-100" : "bg-blue-50 border border-blue-100"
      }`}>
        <span className="text-lg">{slot === "lunch" ? "🌤️" : "🌙"}</span>
        <div>
          <p className={`font-bold ${slot === "lunch" ? "text-orange-700" : "text-blue-700"}`}>
            {slot === "lunch" ? "Lunch Menu" : "Dinner Menu"}
            {view === "weekly" ? ` — ${selDay}` : " — Daily"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {view === "daily"
              ? "Items marked 'daily' appear every day. Set 'Weekly Rotation' to customize per day."
              : `Showing items for ${selDay}. Items marked 'Every Day' always appear.`}
          </p>
        </div>
      </div>

      {/* Add button */}
      <button onClick={() => onAdd(slot)}
        className={`flex items-center gap-2 px-4 py-2.5 text-white font-bold text-sm rounded-xl transition shadow-lg ${
          slot === "lunch"
            ? "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
            : "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
        }`}>
        <FaPlus /> Add {slot === "lunch" ? "Lunch" : "Dinner"} Item
      </button>

      {/* Items grid */}
      {dayItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <span className="text-4xl">{slot === "lunch" ? "🌤️" : "🌙"}</span>
          <p className="text-gray-400 font-medium mt-3">
            No {slot} items {view === "weekly" ? `for ${selDay}` : "yet"}
          </p>
          <p className="text-gray-300 text-xs mt-1">
            Add items that subscribers will receive during {slot}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayItems.map(item => (
            <div key={item._id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition ${
                item.isAvailable ? "border-gray-100" : "border-gray-200 opacity-60"
              }`}>
              <div className="relative h-36 bg-gray-100 overflow-hidden">
                <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80"}
                  alt={item.name} className="w-full h-full object-cover" />
                {/* Slot badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
                    (item.mealSlot||"lunch") === "lunch" ? "bg-orange-500 text-white" :
                    (item.mealSlot||"lunch") === "dinner"? "bg-blue-500 text-white"   : "bg-purple-500 text-white"
                  }`}>
                    {(item.mealSlot||"lunch") === "lunch" ? "🌤️ Lunch" :
                     (item.mealSlot||"lunch") === "dinner"? "🌙 Dinner" : "🌤️🌙 Both"}
                  </span>
                </div>
                {/* Veg dot */}
                <div className="absolute top-2 left-2">
                  <span className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center bg-white ${
                    item.isVeg !== false ? "border-green-600" : "border-red-600"
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg !== false ? "bg-green-600" : "bg-red-600"}`} />
                  </span>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-black text-gray-800 text-sm leading-tight">{item.name}</h3>
                  <span className="text-sm font-black text-orange-500 flex-shrink-0">₹{item.price}</span>
                </div>

                {/* Day tag */}
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.dayOfWeek === "daily" ? "bg-gray-100 text-gray-500" : "bg-purple-100 text-purple-600"
                  }`}>
                    📅 {item.dayOfWeek === "daily" ? "Every Day" : item.dayOfWeek}
                  </span>
                  {item.category?.name && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      {item.category.name}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{item.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => onToggle(item)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                    {item.isAvailable ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
                    {item.isAvailable ? "On" : "Off"}
                  </button>
                  <button onClick={() => onEdit(item)} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition text-blue-500">
                    <FaEdit className="text-xs" />
                  </button>
                  <button onClick={() => onDelete(item._id)} className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition text-red-500">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly overview table */}
      {view === "weekly" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
          <div className="px-5 py-3 border-b border-gray-50">
            <h3 className="font-black text-gray-800 text-sm">
              Weekly {slot === "lunch" ? "Lunch" : "Dinner"} Schedule Overview
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-400 font-semibold">Day</th>
                  <th className="text-left px-4 py-2 text-gray-400 font-semibold">Items</th>
                  <th className="text-left px-4 py-2 text-gray-400 font-semibold">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DAYS.map(day => {
                  const dayMenu = slotItems.filter(i => i.dayOfWeek === day || i.dayOfWeek === "daily");
                  return (
                    <tr key={day} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => { setSelDay(day); }}>
                      <td className="px-4 py-2.5 font-bold text-gray-700">{day.slice(0,3)}</td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">
                        {dayMenu.slice(0,3).map(i => i.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`font-black px-2 py-0.5 rounded-full ${
                          dayMenu.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}>
                          {dayMenu.length} items
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT MENU — Normal like Zomato
// ─────────────────────────────────────────────────────────────────────────────
function RestaurantMenu({ menu, categories, onAdd, onEdit, onDelete, onToggle }) {
  const [filterCat, setFilterCat] = useState("all");
  const [search,    setSearch]    = useState("");
  const [viewMode,  setViewMode]  = useState("grid"); // "grid" | "list"

  const filtered = menu.filter(item => {
    const matchCat    = filterCat === "all" || (item.category?._id || item.category) === filterCat;
    const matchSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category for list view
  const grouped = categories.reduce((acc, cat) => {
    const items = filtered.filter(i => (i.category?._id || i.category) === cat._id);
    if (items.length > 0) acc[cat.name] = items;
    return acc;
  }, {});
  const uncategorized = filtered.filter(i => !i.category || i.category === "");
  if (uncategorized.length > 0) grouped["Other"] = uncategorized;

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition w-44" />

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat("all")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterCat==="all"?"bg-orange-500 text-white":"bg-gray-100 text-gray-500"}`}>
            All ({menu.length})
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setFilterCat(c._id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterCat===c._id?"bg-orange-500 text-white":"bg-gray-100 text-gray-500"}`}>
              {c.name} ({menu.filter(i=>(i.category?._id||i.category)===c._id).length})
            </button>
          ))}
        </div>

        {/* Add button */}
        <button onClick={() => onAdd(null)}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-200">
          <FaPlus /> Add Item
        </button>
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-4xl">🍽️</span>
          <p className="text-gray-400 font-medium mt-3">No items found</p>
          <button onClick={() => onAdd(null)} className="mt-4 px-5 py-2 bg-orange-500 text-white font-bold text-sm rounded-xl">
            Add First Item
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([catName, items]) => (
          <div key={catName}>
            <h3 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
              {catName}
              <span className="text-xs text-gray-400 font-normal">({items.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => (
                <div key={item._id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition flex gap-3 p-3 ${
                    item.isAvailable ? "border-gray-100" : "border-gray-200 opacity-60"
                  }`}>
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"}
                      alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 border-2 rounded-sm flex-shrink-0 flex items-center justify-center ${
                          item.isVeg !== false ? "border-green-600" : "border-red-600"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? "bg-green-600" : "bg-red-600"}`} />
                        </span>
                        <h4 className="text-sm font-bold text-gray-800 leading-tight truncate">{item.name}</h4>
                      </div>
                      <span className="text-sm font-black text-orange-500 flex-shrink-0">₹{item.price}</span>
                    </div>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>}
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => onToggle(item)} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-gray-700 transition">
                        {item.isAvailable ? <FaToggleOn className="text-green-500 text-base" /> : <FaToggleOff className="text-gray-400 text-base" />}
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                      <button onClick={() => onEdit(item)} className="ml-auto p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><FaEdit className="text-xs" /></button>
                      <button onClick={() => onDelete(item._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><FaTrash className="text-xs" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MENU PAGE — Smart switch between cloud kitchen and restaurant
// ─────────────────────────────────────────────────────────────────────────────
export default function Menu({ isCloudKitchen }) {
  const [menu,       setMenu]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | { item, defaultSlot }
  const [deleting,   setDeleting]   = useState(null);

  const fetchAll = async () => {
    try {
      const [m, c] = await Promise.all([API.get("/vendor/menu"), API.get("/vendor/categories")]);
      const menuData = m.data.data || m.data.items || m.data;
      const flat = Array.isArray(menuData) ? menuData : Object.values(menuData).flat();
      setMenu(flat);
      setCategories(c.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = (defaultSlot) => setModal({ item: null, defaultSlot: defaultSlot || "lunch" });
  const handleEdit = (item) => setModal({ item, defaultSlot: item.mealSlot || "lunch" });

  const handleToggle = async (item) => {
    try {
      await API.patch(`/vendor/menu/${item._id}/availability`, { isAvailable: !item.isAvailable });
      setMenu(p => p.map(m => m._id === item._id ? { ...m, isAvailable: !m.isAvailable } : m));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setDeleting(id);
    try { await API.delete(`/vendor/menu/${id}`); setMenu(p => p.filter(m => m._id !== id)); } catch {}
    setDeleting(null);
  };

  if (loading) return (
    <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">
            {isCloudKitchen ? "Subscription Menu" : "Menu Management"}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isCloudKitchen
              ? "Set lunch & dinner items for your subscribers — organize by day for weekly plans"
              : `${menu.length} items across ${categories.length} categories`}
          </p>
        </div>

        {/* Stats for cloud kitchen */}
        {isCloudKitchen && (
          <div className="flex gap-3">
            {[
              { label:"Lunch Items",  val: menu.filter(i=>(i.mealSlot||"lunch")==="lunch"||(i.mealSlot||"lunch")==="both").length, color:"text-orange-500", bg:"bg-orange-50" },
              { label:"Dinner Items", val: menu.filter(i=>(i.mealSlot||"lunch")==="dinner"||(i.mealSlot||"lunch")==="both").length, color:"text-blue-500",   bg:"bg-blue-50"   },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl px-4 py-2 text-center`}>
                <p className={`text-xl font-black ${color}`}>{val}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Render based on vendor type */}
      {isCloudKitchen ? (
        <CloudKitchenMenu
          menu={menu}
          categories={categories}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          fetchAll={fetchAll}
        />
      ) : (
        <RestaurantMenu
          menu={menu}
          categories={categories}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      )}

      {/* Modal */}
      {modal !== null && (
        <ItemModal
          item={modal.item}
          categories={categories}
          isCloudKitchen={isCloudKitchen}
          defaultSlot={modal.defaultSlot}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}