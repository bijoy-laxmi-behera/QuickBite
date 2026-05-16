// src/vendor/pages/Offers.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, FaFire, FaClock } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";

const OFFER_TYPES = [
  { val:"general",    label:"General Offer",     emoji:"🎉" },
  { val:"bogo",       label:"Buy 1 Get 1",        emoji:"🛒" },
  { val:"happy_hour", label:"Happy Hours",         emoji:"⏰" },
  { val:"weekend",    label:"Weekend Special",     emoji:"🎊" },
  { val:"new_user",   label:"New User Offer",      emoji:"👋" },
  { val:"chef",       label:"Chef's Special",      emoji:"👨‍🍳" },
];

const EMPTY = { title:"", description:"", discountPercent:"", validFrom:"", validTo:"", offerType:"general", isActive:true };

function OfferModal({ offer, onClose, onSave }) {
  const [form, setForm]   = useState(offer?._id ? { ...offer } : EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async () => {
    if (!form.title) { alert("Title is required"); return; }
    setSaving(true);
    try {
      if (offer?._id) await API.put(`/vendor/offers/${offer._id}`, form);
      else             await API.post("/vendor/offers", form);
      onSave();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-800">{offer?._id ? "Edit Offer" : "Create Offer"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">

          {/* Offer Type */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 block">Offer Type</label>
            <div className="grid grid-cols-3 gap-2">
              {OFFER_TYPES.map(t => (
                <button key={t.val} onClick={() => f("offerType", t.val)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-bold transition ${
                    form.offerType === t.val ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}>
                  <span className="text-lg">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Offer Title *</label>
            <input value={form.title} onChange={e=>f("title",e.target.value)}
              placeholder="e.g. Weekend Feast — 20% Off!"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Description</label>
            <textarea rows={2} value={form.description} onChange={e=>f("description",e.target.value)}
              placeholder="Details about this offer..."
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
          </div>

          {/* Discount % */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Discount %</label>
            <input type="number" min="0" max="100" value={form.discountPercent} onChange={e=>f("discountPercent",e.target.value)}
              placeholder="20"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
          </div>

          {/* Validity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Valid From</label>
              <input type="date" value={form.validFrom?.split("T")[0]||""} onChange={e=>f("validFrom",e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Valid Until</label>
              <input type="date" value={form.validTo?.split("T")[0]||""} onChange={e=>f("validTo",e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-black rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <FaSpinner className="animate-spin" />}
            {offer?._id ? "Save Changes" : "Create Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Offers() {
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const fetchOffers = async () => {
    try {
      const { data } = await API.get("/vendor/offers");
      setOffers(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try { await API.delete(`/vendor/offers/${id}`); fetchOffers(); } catch {}
  };

  const isActive = (o) => {
    if (!o.isActive) return false;
    if (o.validTo && new Date(o.validTo) < new Date()) return false;
    return true;
  };

  const typeInfo = (val) => OFFER_TYPES.find(t=>t.val===val) || OFFER_TYPES[0];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">Special Offers</h1>
          <p className="text-gray-400 text-sm">{offers.filter(isActive).length} active offers</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-200">
          <FaPlus /> Create Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-orange-500 text-3xl" /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <MdLocalOffer className="text-gray-200 text-5xl mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No offers yet</p>
          <button onClick={() => setModal({})} className="mt-4 px-5 py-2 bg-orange-500 text-white font-bold text-sm rounded-xl">
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offers.map(o => {
            const active = isActive(o);
            const type   = typeInfo(o.offerType);
            return (
              <div key={o._id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${active?"border-gray-100":"border-gray-200 opacity-70"}`}>
                <div className={`px-4 py-3 flex items-center gap-3 ${active?"bg-gradient-to-r from-orange-500 to-amber-400":"bg-gray-100"}`}>
                  <span className="text-2xl">{type.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm leading-tight ${active?"text-white":"text-gray-600"}`}>{o.title}</p>
                    <p className={`text-xs ${active?"text-white/70":"text-gray-400"}`}>{type.label}</p>
                  </div>
                  {o.discountPercent > 0 && (
                    <div className={`text-center flex-shrink-0 ${active?"text-white":"text-gray-500"}`}>
                      <p className="text-2xl font-black leading-none">{o.discountPercent}%</p>
                      <p className="text-[10px] font-bold">OFF</p>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {o.description && <p className="text-sm text-gray-500 mb-3 leading-relaxed">{o.description}</p>}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {!active && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full">INACTIVE</span>}
                    {o.validTo && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full flex items-center gap-1">
                        <FaClock className="text-[9px]" />
                        Until {new Date(o.validTo).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setModal(o)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 text-blue-500 transition">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => deleteOffer(o._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 text-red-500 transition">
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <OfferModal
          offer={modal?._id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchOffers(); }}
        />
      )}
    </div>
  );
}
