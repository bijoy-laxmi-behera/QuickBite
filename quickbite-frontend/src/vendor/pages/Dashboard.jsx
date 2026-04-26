/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";
import { FaDollarSign, FaClipboardList, FaUsers, FaBox } from "react-icons/fa";

function Dashboard({ setPage }) {

  const [overview, setOverview] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ─── FETCH ALL DATA ───────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, menuRes, categoryRes] = await Promise.all([
        API.get("/vendor/overview"),
        API.get("/vendor/menu"),
        API.get("/vendor/categories"),
      ]);
      setOverview(overviewRes.data.data);
      setMenu(menuRes.data.items || []);
      setCategories(categoryRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ─── EXPORT CSV ───────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await API.get("/vendor/orders");
      const orders = res.data.orders || [];
      if (orders.length === 0) {
        toast("No orders to export");
        return;
      }
      const csv = [
        ["Order ID", "Amount", "Status", "Date"],
        ...orders.map((o) => [
          o._id, o.totalAmount, o.status,
          new Date(o.createdAt).toLocaleDateString(),
        ]),
      ].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "orders_report.csv");
      toast.success("Report downloaded");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // ─── IMAGE PREVIEW ────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ─── CREATE MENU ITEM ─────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price and category are required");
      return;
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (image) formData.append("image", image);

      await API.post("/vendor/menu", formData);
      toast.success("Item added successfully!");

      setForm({ name: "", price: "", category: "", description: "" });
      setImage(null);
      setImagePreview(null);
      setShowModal(false);

      const res = await API.get("/vendor/menu");
      setMenu(res.data.items || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── CLOSE MODAL ─────────────────────────────────────────────
  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ name: "", price: "", category: "", description: "" });
    setImage(null);
    setImagePreview(null);
  };

  // ─── CATEGORY DISPLAY ─────────────────────────────────────────
  // handles both string "Breakfast" and ObjectId reference {name: "Breakfast"}
  const getCategoryDisplay = (item) => {
    if (!item.category) return "N/A";
    if (typeof item.category === "string") return item.category;
    if (typeof item.category === "object") return item.category.name || "N/A";
    return "N/A";
  };

  // ─── LOADING ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
            Export Report
          </button>
          <button onClick={() => setPage("menu")}
            className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition">
            Manage Menu
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Revenue" value={`₹${overview?.revenue || 0}`} icon={<FaDollarSign />} color="bg-orange-100 text-orange-500" />
        <StatCard title="Orders" value={overview?.totalOrders || 0} icon={<FaClipboardList />} color="bg-blue-100 text-blue-500" />
        <StatCard title="Prep Time" value={`${overview?.avgPrepTime || 0} min`} icon={<FaBox />} color="bg-green-100 text-green-500" />
        <StatCard title="Rating" value={`⭐ ${overview?.rating?.toFixed(1) || "0.0"}`} icon={<FaUsers />} color="bg-purple-100 text-purple-500" />
      </div>

      {/* ── MENU QUICK VIEW ── */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">Menu Quick View</h2>
            <p className="text-xs text-gray-400 mt-0.5">{menu.length} items total</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition">
            + Add New Item
          </button>
        </div>

        {menu.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">🍽️</p>
            <p className="text-sm">No menu items yet. Add your first dish!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="text-left py-2">Dish</th>
                  <th className="text-left">Category</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {menu.slice(0, 5).map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="text-gray-500">{getCategoryDisplay(item)}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.isAvailable ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}>
                        {item.isAvailable ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="font-semibold text-orange-500">₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {menu.length > 5 && (
              <p onClick={() => setPage("menu")}
                className="text-center text-xs text-orange-500 mt-3 cursor-pointer hover:underline">
                View all {menu.length} items →
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── ADD MENU MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Add Menu Item</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            <div className="p-5 space-y-4">

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Dish Name *</label>
                <input type="text" placeholder="e.g. Paneer Butter Masala"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Price (₹) *</label>
                <input type="number" placeholder="e.g. 250"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              {/* Category — dropdown if categories exist, text input if not */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Category *</label>
                {categories.length > 0 ? (
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" placeholder="e.g. Breakfast, Lunch, Dinner"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {categories.length === 0 ? "💡 Type a category name" : `${categories.length} categories available`}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea placeholder="Short description..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Dish Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-3 w-full h-36 object-cover rounded-xl border" />
                )}
              </div>

            </div>

            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={submitting}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </span>
                ) : "Save Dish"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-bold text-gray-800 mt-0.5">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  );
}

export default Dashboard;