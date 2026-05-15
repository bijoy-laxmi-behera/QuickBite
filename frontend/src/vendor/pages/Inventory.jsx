// src/vendor/pages/Inventory.jsx
import { useState, useEffect } from "react";
import API from "../../services/axios";
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export default function Inventory() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ name:"", quantity:"", unit:"", minQuantity:"" });
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState("all");

  const fetchItems = async () => {
    try {
      const { data } = await API.get("/vendor/inventory");
      setItems(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.quantity) { alert("Name and quantity are required"); return; }
    setSaving(true);
    try {
      if (editing) await API.put(`/vendor/inventory/${editing}`, form);
      else         await API.post("/vendor/inventory", form);
      setForm({ name:"", quantity:"", unit:"", minQuantity:"" });
      setEditing(null);
      fetchItems();
    } catch (e) { alert(e.response?.data?.message || "Save failed"); }
    setSaving(false);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;
    try { await API.delete(`/vendor/inventory/${id}`); fetchItems(); } catch {}
  };

  const restock = async (id) => {
    const qty = prompt("Enter quantity to add:");
    if (!qty || isNaN(qty)) return;
    try { await API.patch(`/vendor/inventory/${id}/restock`, { quantity: parseInt(qty) }); fetchItems(); } catch {}
  };

  const lowStock = items.filter(i => i.quantity <= (i.minQuantity || 5));
  const filtered = tab === "low" ? lowStock : items;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">Inventory</h1>
          {lowStock.length > 0 && (
            <p className="text-xs text-red-500 font-semibold mt-0.5 flex items-center gap-1">
              <FaExclamationTriangle className="text-[10px]" /> {lowStock.length} item(s) low on stock
            </p>
          )}
        </div>
      </div>

      {/* Add/Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-black text-gray-700 mb-4">{editing ? "Edit Ingredient" : "Add Ingredient"}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {[
            { k:"name",        label:"Name *",        placeholder:"e.g. Tomatoes" },
            { k:"quantity",    label:"Quantity *",     placeholder:"100",   type:"number" },
            { k:"unit",        label:"Unit",           placeholder:"kg/L/pcs" },
            { k:"minQuantity", label:"Min Stock Alert",placeholder:"10",    type:"number" },
          ].map(({ k, label, placeholder, type }) => (
            <div key={k}>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</label>
              <input type={type || "text"} value={form[k]} onChange={e => f(k, e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition disabled:opacity-50">
            {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
            {editing ? "Save Changes" : "Add Ingredient"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ name:"", quantity:"", unit:"", minQuantity:"" }); }}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-xl transition">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[["all","All Items"],["low","Low Stock"]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab===val?"bg-orange-500 text-white":"bg-gray-100 text-gray-500"}`}>
            {label} {val === "low" && lowStock.length > 0 && `(${lowStock.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-orange-500 text-2xl" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No items found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Ingredient","Quantity","Unit","Min Stock","Status","Actions"].map(h => (
                  <th key={h} className="text-xs text-gray-400 font-semibold uppercase tracking-wide py-3 px-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => {
                const isLow = item.quantity <= (item.minQuantity || 5);
                return (
                  <tr key={item._id} className={isLow ? "bg-red-50/30" : ""}>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">{item.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.unit || "—"}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.minQuantity || "—"}</td>
                    <td className="py-3 px-4">
                      {isLow ? (
                        <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <FaExclamationTriangle className="text-[9px]" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg">OK</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => restock(item._id)}
                          className="text-xs px-2.5 py-1.5 bg-blue-100 text-blue-600 font-bold rounded-lg hover:bg-blue-200 transition">
                          Restock
                        </button>
                        <button onClick={() => { setEditing(item._id); setForm({ name:item.name, quantity:item.quantity, unit:item.unit||"", minQuantity:item.minQuantity||"" }); }}
                          className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                          <FaEdit className="text-xs" />
                        </button>
                        <button onClick={() => deleteItem(item._id)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
