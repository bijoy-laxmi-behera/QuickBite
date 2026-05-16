import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDelivery } from "../DeliveryContext";
import { Camera, User, Phone, Bike, LogOut, Star, ChevronRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Profile() {
  const { partner, token } = useDelivery();
  const [form, setForm]     = useState({ name: "", phone: "", vehicle: "" });
  const [edit, setEdit]     = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (partner) {
      setForm({ name: partner.name || "", phone: partner.phone || "", vehicle: partner.vehicle?.type || "" });
    }
  }, [partner]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/delivery/me`, form, { headers: { Authorization: `Bearer ${token}` } });
      setEdit(false);
    } catch {}
    finally { setSaving(false); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      await axios.put(`${API}/delivery/me/avatar`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left: avatar + quick links */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-orange-300 overflow-hidden flex items-center justify-center">
              {partner?.avatar
                ? <img src={partner.avatar} alt="" className="w-full h-full object-cover" />
                : <User size={36} className="text-gray-400" />
              }
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-md"
            >
              <Camera size={12} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900">{partner?.name || "Partner"}</p>
            <p className="text-sm text-gray-400">{partner?.email}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star size={13} className="text-yellow-400" fill="currentColor" />
              <span className="text-sm font-bold text-yellow-500">
                {partner?.rating?.toFixed(1) || "New"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Quick Links</p>
          {[
            { label: "Earnings",    href: "/delivery/earnings"    },
            { label: "Performance", href: "/delivery/performance" },
            { label: "Support",     href: "/delivery/support"     },
          ].map(({ label, href }) => (
            <a key={href} href={href}
              className="flex items-center justify-between py-2.5 text-sm text-gray-500 hover:text-gray-900 border-b border-gray-100 last:border-0 transition-colors">
              {label} <ChevronRight size={14} className="text-gray-300" />
            </a>
          ))}
        </div>

        <button
          onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 border border-red-200 rounded-xl text-red-500 font-semibold text-sm hover:bg-red-100 transition-colors"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>

      {/* Right: edit form */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
            <button
              onClick={() => edit ? save() : setEdit(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                edit ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500 border border-gray-200 hover:text-gray-900"
              }`}
            >
              {saving ? "Saving..." : edit ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          {[
            { label: "Full Name",    key: "name",    icon: User,  type: "text" },
            { label: "Phone Number", key: "phone",   icon: Phone, type: "tel"  },
            { label: "Vehicle Type", key: "vehicle", icon: Bike,  type: "text" },
          ].map(({ label, key, icon: Icon, type }) => (
            <div key={key}>
              <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</label>
              <div className="flex items-center gap-3 mt-1.5">
                <Icon size={14} className="text-gray-400 flex-shrink-0" />
                {edit
                  ? <input type={type} value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                    />
                  : <p className="text-sm text-gray-700 font-medium">{form[key] || "—"}</p>
                }
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Account Details</h3>
          {[
            { label: "Email",        value: partner?.email || "—" },
            { label: "Role",         value: "Delivery Partner" },
            { label: "Member since", value: partner?.createdAt
                ? new Date(partner.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <span className="text-sm text-gray-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
