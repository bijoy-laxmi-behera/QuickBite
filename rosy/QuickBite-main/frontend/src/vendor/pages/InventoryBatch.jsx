import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

function InventoryBatch() {

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    threshold: ""
  });

  // FETCH INVENTORY
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await API.get("/vendor/inventory");
      setInventory(res.data.data);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // ADD INGREDIENT
  const handleAdd = async () => {
    if (!form.name || !form.quantity) {
      return toast.error("Name & Quantity required");
    }

    try {
      await API.post("/vendor/inventory", form);

      toast.success("Ingredient added");
      setShowModal(false);

      setForm({
        name: "",
        quantity: "",
        unit: "",
        threshold: ""
      });

      fetchInventory();
    } catch {
      toast.error("Failed to add ingredient");
    }
  };

  // RESTOCK
  const handleRestock = async (id) => {
    try {
      await API.patch(`/vendor/inventory/${id}/restock`, {
        quantity: 5,
      });

      toast.success("Stock updated");
      fetchInventory();
    } catch {
      toast.error("Restock failed");
    }
  };

  // FILTER
  const filteredInventory =
    filter === "low"
      ? inventory.filter(i => i.quantity <= i.threshold)
      : inventory;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">

        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-gray-500 text-sm">
            Manage kitchen ingredients and stock levels.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 w-full sm:w-auto"
        >
          + Add Ingredient
        </button>

      </div>

      {/* ALERT */}
      {inventory.some(i => i.quantity <= i.threshold) && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
          ⚠️ Some ingredients are running low. Please restock!
        </div>
      )}

      {/* FILTER */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-orange-500 text-white" : "border"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter("low")}
          className={`px-3 py-1 rounded ${
            filter === "low" ? "bg-red-500 text-white" : "border"
          }`}
        >
          Low Stock
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">

        <h2 className="text-lg font-semibold mb-4">
          Ingredient Inventory
        </h2>

        <div className="overflow-x-auto">

<table className="min-w-[700px] w-full text-sm table-fixed">

  {/* HEADER */}
  <thead className="text-gray-500 border-b bg-gray-50">
    <tr>
      <th className="text-left px-4 py-3 w-1/4">Ingredient</th>
      <th className="text-left px-4 py-3 w-1/5">Quantity</th>
      <th className="text-left px-4 py-3 w-1/5">Unit</th>
      <th className="text-left px-4 py-3 w-1/5">Status</th>
      <th className="text-left px-4 py-3 w-1/5">Action</th>
    </tr>
  </thead>

  {/* BODY */}
  <tbody>

    {filteredInventory.map((item) => {
      const isLow = item.quantity <= item.threshold;

      return (
        <tr key={item._id} className="border-b hover:bg-gray-50">

          <td className="px-4 py-3 font-medium text-gray-800">
            {item.name}
          </td>

          <td className="px-4 py-3">
            {item.quantity}
          </td>

          <td className="px-4 py-3">
            {item.unit}
          </td>

          <td className="px-4 py-3">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                isLow
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {isLow ? "Low" : "Good"}
            </span>
          </td>

          <td className="px-4 py-3">
            <button
              onClick={() => handleRestock(item._id)}
              className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs hover:bg-orange-600"
            >
              Restock
            </button>
          </td>

        </tr>
      );
    })}

  </tbody>

</table>
</div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-lg font-semibold mb-4">
              Add Ingredient
            </h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              placeholder="Unit (kg, pcs)"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full border p-2 mb-2 rounded"
            />

            <input
              type="number"
              placeholder="Low Stock Threshold"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              className="w-full border p-2 mb-3 rounded"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAdd}
                className="bg-orange-500 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default InventoryBatch;