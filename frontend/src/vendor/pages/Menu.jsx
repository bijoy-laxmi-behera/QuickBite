// src/vendor/pages/Menu.jsx
import { useState, useEffect, useRef } from "react";
import API from "../../services/axios";
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner, FaTimes, FaLeaf, FaDrumstickBite } from "react-icons/fa";

const EMPTY_FORM = { name:"", description:"", price:"", category:"", isVeg:true, isAvailable:true, image:null };

function MenuModal({ item, categories, onClose, onSave }) {
  const [form, setForm]   = useState(item ? { ...item, category: item.category?._id || item.category || "" } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(item?.image || null);
  const fileRef = useRef();

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    f("image", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) { alert("Name and price are required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "image" && v instanceof File) fd.append("image", v);
        else if (k !== "image") fd.append(k, v);
      });
      if (item?._id) await API.put(`/vendor/menu/${item._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else           await API.post("/vendor/menu", fd,           { headers: { "Content-Type": "multipart/form-data" } });
      onSave();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-800">{item ? "Edit Item" : "Add Menu Item"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">

          {/* Image */}
          <div className="flex flex-col items-center gap-3">
            <div onClick={() => fileRef.current?.click()}
              className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-orange-400 transition bg-gray-50">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : (
                <div className="text-center">
                  <p className="text-2xl">📸</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload image</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Item Name *</label>
            <input value={form.name} onChange={e => f("name", e.target.value)}
              placeholder="e.g. Paneer Butter Masala"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => f("price", e.target.value)}
                placeholder="0"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Category</label>
              <select value={form.category} onChange={e => f("category", e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition bg-white">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Description</label>
            <textarea rows={2} value={form.description} onChange={e => f("description", e.target.value)}
              placeholder="Brief description..."
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
          </div>

          {/* Veg / Non-Veg */}
          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide block mb-2">Type</label>
            <div className="flex gap-2">
              {[{v:true,l:"Vegetarian",icon:<FaLeaf className="text-green-500" />},{v:false,l:"Non-Veg",icon:<FaDrumstickBite className="text-red-500" />}].map(opt => (
                <button key={String(opt.v)} onClick={() => f("isVeg", opt.v)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                    form.isVeg === opt.v ? (opt.v ? "border-green-400 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-700") : "border-gray-100 bg-gray-50 text-gray-500"
                  }`}>
                  {opt.icon} {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Available</span>
            <button onClick={() => f("isAvailable", !form.isAvailable)}>
              {form.isAvailable
                ? <FaToggleOn  className="text-green-500 text-2xl" />
                : <FaToggleOff className="text-gray-400 text-2xl" />}
            </button>
          </div>

          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <FaSpinner className="animate-spin" /> : null}
            {item ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const [menu,       setMenu]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | "add" | item
  const [filterCat,  setFilterCat]  = useState("all");
  const [search,     setSearch]     = useState("");
  const [deleting,   setDeleting]   = useState(null);

  const fetchAll = async () => {
    try {
      const [m, c] = await Promise.all([API.get("/vendor/menu"), API.get("/vendor/categories")]);
      // menu returns grouped object; flatten
      const menuData = m.data.data || m.data;
      const flat = Array.isArray(menuData) ? menuData :
        Object.values(menuData).flat();
      setMenu(flat);
      setCategories(c.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleAvail = async (item) => {
    try {
      await API.patch(`/vendor/menu/${item._id}/availability`, { isAvailable: !item.isAvailable });
      setMenu(p => p.map(m => m._id === item._id ? { ...m, isAvailable: !m.isAvailable } : m));
    } catch {}
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setDeleting(id);
    try {
      await API.delete(`/vendor/menu/${id}`);
      setMenu(p => p.filter(m => m._id !== id));
    } catch {} setDeleting(null);
  };

  const filtered = menu.filter(item => {
    const matchCat = filterCat === "all" || (item.category?._id || item.category) === filterCat;
    const matchSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-800">Menu Items</h1>
          <p className="text-gray-400 text-sm">{menu.length} items total</p>
        </div>
        <button onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-200">
          <FaPlus /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search items..."
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition w-48" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCat("all")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterCat === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setFilterCat(c._id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${filterCat === c._id ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-4xl">🍽️</span>
          <p className="text-gray-400 font-medium mt-3">No items found</p>
          <button onClick={() => setModal("add")} className="mt-4 px-5 py-2 bg-orange-500 text-white font-bold text-sm rounded-xl">
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item._id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition ${item.isAvailable ? "border-gray-100" : "border-gray-200 opacity-70"}`}>
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80"}
                  alt={item.name} className="w-full h-full object-cover" />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">Unavailable</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${item.isVeg !== false ? "border-green-600 bg-white" : "border-red-600 bg-white"}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg !== false ? "bg-green-600" : "bg-red-600"}`} />
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-gray-800 text-sm leading-tight">{item.name}</h3>
                  <span className="text-base font-black text-orange-500 flex-shrink-0">₹{item.price}</span>
                </div>
                {item.category?.name && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {item.category.name}
                  </span>
                )}
                {item.description && (
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => toggleAvail(item)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                    {item.isAvailable ? <FaToggleOn className="text-green-500" /> : <FaToggleOff className="text-gray-400" />}
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </button>
                  <button onClick={() => setModal(item)} className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition text-blue-500">
                    <FaEdit className="text-xs" />
                  </button>
                  <button onClick={() => deleteItem(item._id)} disabled={deleting === item._id}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition text-red-500">
                    {deleting === item._id ? <FaSpinner className="text-xs animate-spin" /> : <FaTrash className="text-xs" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <MenuModal
          item={modal === "add" ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
