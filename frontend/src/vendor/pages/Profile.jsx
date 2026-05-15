// src/vendor/pages/Profile.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaCamera, FaSpinner, FaSave } from "react-icons/fa";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export default function Profile({ restaurant: initRest, setRestaurant, isCloudKitchen }) {
  const [form,    setForm]    = useState({ name:"", description:"", phone:"", cuisine:"", address:"", city:"", pincode:"", deliveryTime:"", minOrder:"" });
  const [hours,   setHours]   = useState({});
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState("general");
  const [preview, setPreview] = useState(null);
  const [imgFile, setImgFile] = useState(null);

  useEffect(() => {
    if (initRest) {
      setForm({
        name:         initRest.name         || "",
        description:  initRest.description  || "",
        phone:        initRest.phone        || "",
        cuisine:      Array.isArray(initRest.cuisine) ? initRest.cuisine.join(", ") : initRest.cuisine || "",
        address:      initRest.address?.street || initRest.address || "",
        city:         initRest.address?.city   || initRest.location?.city || "",
        pincode:      initRest.address?.pincode || "",
        deliveryTime: initRest.deliveryTime || "",
        minOrder:     initRest.minOrder     || "",
      });
      setPreview(initRest.image || initRest.logo || null);
    }
    // Fetch hours
    API.get("/vendor/profile/hours").then(({ data }) => {
      if (data.data) setHours(data.data);
    }).catch(() => {});
  }, [initRest]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append("image", imgFile);
      const { data } = await API.put("/vendor/profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (setRestaurant) setRestaurant(data.data || data);
      alert("Profile updated successfully!");
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  const handleHoursSave = async () => {
    setSaving(true);
    try {
      await API.put("/vendor/profile/hours", { hours });
      alert("Hours updated!");
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-black text-gray-800">Restaurant Profile</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {["general","hours"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab===t?"bg-orange-500 text-white":"bg-gray-100 text-gray-500"}`}>
            {t === "general" ? "General Info" : "Operating Hours"}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">

          {/* Cover image */}
          <div className="relative">
            <div className="h-40 w-full rounded-xl overflow-hidden bg-gray-100">
              <img src={preview || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80"}
                alt="Restaurant" className="w-full h-full object-cover" />
            </div>
            <label className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
              <FaCamera className="text-gray-600 text-sm" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { k:"name",         label:"Restaurant Name *" },
              { k:"phone",        label:"Phone Number" },
              { k:"cuisine",      label:"Cuisine (comma separated)" },
              { k:"city",         label:"City" },
              { k:"pincode",      label:"Pincode" },
              { k:"deliveryTime", label:"Delivery Time (mins)", type:"number" },
              { k:"minOrder",     label:"Min Order (₹)",        type:"number" },
            ].map(({ k, label, type }) => (
              <div key={k}>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</label>
                <input type={type || "text"} value={form[k]} onChange={e => f(k, e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Street Address</label>
            <input value={form.address} onChange={e => f("address", e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
          </div>

          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Description</label>
            <textarea rows={3} value={form.description} onChange={e => f("description", e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
          </div>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 shadow-lg shadow-orange-200">
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Save Profile
          </button>
        </div>
      )}

      {tab === "hours" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="text-sm text-gray-400">Set your opening and closing hours for each day.</p>
          {DAYS.map(day => {
            const dayHours = hours[day] || { open:"09:00", close:"22:00", isOpen:true };
            return (
              <div key={day} className="flex items-center gap-4 flex-wrap">
                <div className="w-24">
                  <span className="text-sm font-black text-gray-700 capitalize">{day.slice(0,3)}</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input type="checkbox" checked={dayHours.isOpen}
                    onChange={e => setHours(h => ({ ...h, [day]: { ...dayHours, isOpen: e.target.checked } }))}
                    className="rounded accent-orange-500" />
                  Open
                </label>
                {dayHours.isOpen && (
                  <>
                    <input type="time" value={dayHours.open || "09:00"}
                      onChange={e => setHours(h => ({ ...h, [day]: { ...dayHours, open: e.target.value } }))}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400 transition" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={dayHours.close || "22:00"}
                      onChange={e => setHours(h => ({ ...h, [day]: { ...dayHours, close: e.target.value } }))}
                      className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-orange-400 transition" />
                  </>
                )}
                {!dayHours.isOpen && <span className="text-sm text-gray-300 italic">Closed</span>}
              </div>
            );
          })}
          <button onClick={handleHoursSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 shadow-lg shadow-orange-200 mt-4">
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Save Hours
          </button>
        </div>
      )}
    </div>
  );
}
