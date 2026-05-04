import { useState } from "react";
import { FaMapMarkerAlt, FaHome, FaBriefcase, FaPlus, FaTrash, FaCheck } from "react-icons/fa";

const typeConfig = {
  Home:  { icon: <FaHome />,     color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-200" },
  Work:  { icon: <FaBriefcase />, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200" },
  Other: { icon: <FaMapMarkerAlt />, color: "text-green-500", bg: "bg-green-50",  border: "border-green-200" },
};

function Addresses() {
  const [addresses, setAddresses] = useState([
    { id: 1, type: "Home", address: "12, Sunshine Apartments, Andheri West, Mumbai 400053", isDefault: true },
  ]);
  const [input, setInput] = useState("");
  const [type, setType] = useState("Home");
  const [adding, setAdding] = useState(false);

  const addAddress = () => {
    if (!input.trim()) return;
    setAddresses([...addresses, { id: Date.now(), type, address: input, isDefault: false }]);
    setInput("");
    setAdding(false);
  };

  const removeAddress = (id) => setAddresses((prev) => prev.filter((a) => a.id !== id));
  const setDefault = (id) => setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">My Addresses</h2>
          </div>
          <button onClick={() => setAdding(!adding)}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition">
            <FaPlus className="text-[10px]" /> Add New
          </button>
        </div>

        {/* ADD FORM */}
        {adding && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 mb-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Add New Address</h3>
            <div className="flex gap-2 mb-3">
              {Object.keys(typeConfig).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${type === t ? `${typeConfig[t].bg} ${typeConfig[t].border} ${typeConfig[t].color}` : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                  {t}
                </button>
              ))}
            </div>
            <textarea rows={2} value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Enter full address with landmark..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition resize-none mb-3" />
            <button onClick={addAddress}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition">
              Save Address
            </button>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-3">
          {addresses.map((addr) => {
            const cfg = typeConfig[addr.type] || typeConfig.Other;
            return (
              <div key={addr.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${addr.isDefault ? "border-orange-200" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold ${cfg.color}`}>{addr.type}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-semibold">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{addr.address}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {!addr.isDefault && (
                    <button onClick={() => setDefault(addr.id)}
                      className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition font-semibold">
                      <FaCheck className="text-[10px]" /> Set Default
                    </button>
                  )}
                  <button onClick={() => removeAddress(addr.id)}
                    className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold ml-auto">
                    <FaTrash className="text-[10px]" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Addresses;