// src/vendor/pages/Settings.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaSpinner, FaSave } from "react-icons/fa";

export default function Settings() {
  const [settings, setSettings] = useState({
    autoAcceptOrders: false,
    notifyOnNewOrder: true,
    notifyOnReview:   true,
    prepTime:         30,
    maxOrdersPerHour: 20,
  });
  const [bank,    setBank]    = useState({ accountNumber:"", ifsc:"", bankName:"", accountHolderName:"" });
  const [saving,  setSaving]  = useState(false);
  const [bankSav, setBankSav] = useState(false);
  const [tab,     setTab]     = useState("general");

  useEffect(() => {
    API.get("/vendor/settings").then(({ data }) => {
      if (data.data) setSettings(s => ({ ...s, ...data.data }));
    }).catch(() => {});
    API.get("/vendor/profile").then(({ data }) => {
      const b = data.data?.bankDetails || data.data?.bank || {};
      setBank(s => ({ ...s, ...b }));
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await API.put("/vendor/settings", settings);
      alert("Settings saved!");
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  const saveBank = async () => {
    setBankSav(true);
    try {
      await API.patch("/vendor/profile/bank", bank);
      alert("Bank details saved!");
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    setBankSav(false);
  };

  const toggle = (k) => setSettings(s => ({ ...s, [k]: !s[k] }));
  const fb = (k, v) => setBank(b => ({ ...b, [k]: v }));

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-black text-gray-800">Settings</h1>

      <div className="flex gap-2">
        {["general","bank"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab===t?"bg-orange-500 text-white":"bg-gray-100 text-gray-500"}`}>
            {t === "general" ? "General" : "Bank Details"}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">

          {/* Toggles */}
          {[
            { k:"autoAcceptOrders", label:"Auto Accept Orders",        sub:"Automatically accept incoming orders" },
            { k:"notifyOnNewOrder", label:"Notify on New Order",       sub:"Get notified when a new order arrives" },
            { k:"notifyOnReview",   label:"Notify on New Review",      sub:"Get notified when a customer reviews" },
          ].map(({ k, label, sub }) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <button onClick={() => toggle(k)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${settings[k] ? "bg-orange-500" : "bg-gray-200"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings[k] ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          ))}

          {/* Number inputs */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { k:"prepTime",         label:"Avg Prep Time (mins)" },
              { k:"maxOrdersPerHour", label:"Max Orders / Hour"    },
            ].map(({ k, label }) => (
              <div key={k}>
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</label>
                <input type="number" value={settings[k]}
                  onChange={e => setSettings(s => ({ ...s, [k]: parseInt(e.target.value) || 0 }))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
              </div>
            ))}
          </div>

          <button onClick={saveSettings} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 shadow-lg shadow-orange-200">
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Save Settings
          </button>
        </div>
      )}

      {tab === "bank" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <p className="text-sm text-gray-400">Your bank details are used for payouts.</p>
          {[
            { k:"accountHolderName", label:"Account Holder Name" },
            { k:"accountNumber",     label:"Account Number" },
            { k:"ifsc",              label:"IFSC Code" },
            { k:"bankName",          label:"Bank Name" },
          ].map(({ k, label }) => (
            <div key={k}>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</label>
              <input value={bank[k] || ""} onChange={e => fb(k, e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
          ))}
          <button onClick={saveBank} disabled={bankSav}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition disabled:opacity-50 shadow-lg shadow-orange-200">
            {bankSav ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Save Bank Details
          </button>
        </div>
      )}
    </div>
  );
}
