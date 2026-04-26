/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

function InventoryBatch() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    threshold: "",
  });

  // ─── FETCH INVENTORY ──────────────────────────────────────────
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await API.get("/vendor/inventory");
      setInventory(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // ─── ADD INGREDIENT ───────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.name || !form.quantity) {
      return toast.error("Name & Quantity required");
    }
    try {
      await API.post("/vendor/inventory", form);
      toast.success("Ingredient added");
      setShowModal(false);
      setForm({ name: "", quantity: "", unit: "pcs", threshold: "" });
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add ingredient");
    }
  };

  // ─── RESTOCK ──────────────────────────────────────────────────
  const handleRestock = async () => {
    if (!restockQty || Number(restockQty) <= 0) {
      return toast.error("Enter a valid quantity");
    }
    try {
      await API.patch(`/vendor/inventory/${restockId}/restock`, {
        quantity: Number(restockQty),
      });
      toast.success("Stock updated");
      setRestockId(null);
      setRestockQty("");
      fetchInventory();
    } catch (err) {
      toast.error("Restock failed");
    }
  };

  // ─── DELETE INGREDIENT ────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;
    try {
      await API.delete(`/vendor/inventory/${id}`);
      toast.success("Ingredient deleted!");
      fetchInventory();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ─── FILTER ───────────────────────────────────────────────────
  const lowStockItems = inventory.filter((i) => i.quantity <= i.threshold);
  const filteredInventory = filter === "low" ? lowStockItems : inventory;

  // ─── LOADING ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-500 text-sm">
            Manage kitchen ingredients and stock levels.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 w-full sm:w-auto text-sm font-medium transition"
        >
          + Add Ingredient
        </button>
      </div>

      {/* ── LOW STOCK ALERT ── */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
          ⚠️ <span><b>{lowStockItems.length}</b> ingredient(s) running low — please restock!</span>
        </div>
      )}

      {/* ── FILTER TABS ── */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? "bg-orange-500 text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          All ({inventory.length})
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            filter === "low"
              ? "bg-red-500 text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Low Stock ({lowStockItems.length})
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Ingredient Inventory</h2>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-sm">
              {filter === "low"
                ? "No low stock items! You're all good."
                : "No ingredients added yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm table-fixed">
              <thead className="text-gray-500 border-b bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 w-1/4">Ingredient</th>
                  <th className="text-left px-4 py-3 w-1/5">Quantity</th>
                  <th className="text-left px-4 py-3 w-1/5">Unit</th>
                  <th className="text-left px-4 py-3 w-1/5">Status</th>
                  <th className="text-left px-4 py-3 w-1/5">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const isLow = item.quantity <= item.threshold;
                  return (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{item.unit || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          isLow
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}>
                          {isLow ? "⚠ Low" : "✓ Good"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setRestockId(item._id); setRestockQty(""); }}
                            className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600 transition"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD INGREDIENT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Add Ingredient</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >✕</button>
            </div>

            <div className="p-5 space-y-4">

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Name *</label>
                <input
                  placeholder="e.g. Rice, Paneer, Oil"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Quantity *</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* ✅ Dropdown matches enum exactly */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Unit</label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="pcs">pcs (pieces)</option>
                  <option value="kg">kg (kilogram)</option>
                  <option value="g">g (gram)</option>
                  <option value="ltr">ltr (litre)</option>
                  <option value="ml">ml (millilitre)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  placeholder="e.g. 2 (alert when stock falls below this)"
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 px-5 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition"
              >
                Add Ingredient
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── RESTOCK MODAL ── */}
      {restockId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">

            <h2 className="text-lg font-bold text-gray-800 mb-1">Restock Ingredient</h2>
            <p className="text-sm text-gray-400 mb-4">How much stock are you adding?</p>

            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Quantity to Add *
            </label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRestockId(null); setRestockQty(""); }}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition"
              >
                Confirm Restock
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default InventoryBatch;