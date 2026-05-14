import { useEffect, useState } from "react";
import API from "../../services/axios";
import toast from "react-hot-toast";

const defaultSettings = {
  deliveryFee: 40,
  serviceFee: 10,
  taxRate: 5,
  maxDeliveryDistance: 10,
  currency: "INR",
  maintenanceMode: false,
  supportEmail: "",
  allowCOD: true,
  allowOnlinePayment: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/admin/settings");
        setSettings({ ...defaultSettings, ...res.data });
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await API.put("/admin/settings", settings);
      toast.success("Settings saved!");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Fees */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-5">💰 Fee Configuration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "deliveryFee",  label: "Delivery Fee (₹)",    type: "number" },
            { key: "serviceFee",   label: "Service Fee (₹)",     type: "number" },
            { key: "taxRate",      label: "Tax Rate (%)",         type: "number" },
            { key: "maxDeliveryDistance", label: "Max Delivery Distance (km)", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{f.label}</label>
              <input type={f.type} value={settings[f.key] || ""}
                onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-5">📬 Contact Settings</h3>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Support Email</label>
          <input type="email" value={settings.supportEmail || ""}
            onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
            placeholder="support@quickbite.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-5">⚙️ Platform Controls</h3>
        <div className="space-y-4">
          {[
            { key: "allowCOD",            label: "Allow Cash on Delivery",   desc: "Enable COD payment option for customers" },
            { key: "allowOnlinePayment",  label: "Allow Online Payment",     desc: "Enable online/UPI payment methods" },
            { key: "maintenanceMode",     label: "Maintenance Mode",         desc: "Take the platform offline for maintenance", danger: true },
          ].map(toggle => (
            <div key={toggle.key} className={`flex items-center justify-between p-4 rounded-xl border ${toggle.danger && settings[toggle.key] ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
              <div>
                <p className={`text-sm font-semibold ${toggle.danger && settings[toggle.key] ? "text-red-700" : "text-gray-800"}`}>{toggle.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{toggle.desc}</p>
              </div>
              <button onClick={() => setSettings({ ...settings, [toggle.key]: !settings[toggle.key] })}
                className={`relative w-12 h-6 rounded-full transition-all ${settings[toggle.key] ? (toggle.danger ? "bg-red-500" : "bg-orange-500") : "bg-gray-300"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[toggle.key] ? "left-7" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-2xl font-bold transition">
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
