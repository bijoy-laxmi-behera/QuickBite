import { useEffect, useState } from "react";
import API from "@/services/axios"; // ✅ FIXED
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";

import {
  FaDollarSign,
  FaClipboardList,
  FaUsers,
  FaBox,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [image, setImage] = useState(null);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, menuRes] = await Promise.all([
          API.get("/vendor/overview"),
          API.get("/vendor/menu"),
        ]);

        setOverview(overviewRes.data.data);
        setMenu(menuRes.data.items);
      } catch (error) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // EXPORT CSV
  const handleExport = async () => {
    try {
      const res = await API.get("/vendor/orders");

      const orders = res.data.orders;

      const csv = [
        ["Order ID", "Amount", "Status", "Date"],
        ...orders.map((o) => [
          o._id,
          o.totalAmount,
          o.status,
          new Date(o.createdAt).toLocaleDateString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "orders_report.csv");

      toast.success("Report downloaded");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // CREATE MENU ITEM
  const handleCreate = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (image) formData.append("image", image);

      await API.post("/vendor/menu", formData);

      toast.success("Item added");
      setShowModal(false);

      const res = await API.get("/vendor/menu");
      setMenu(res.data.items);

    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Export Report
          </button>

          <button
            onClick={() => navigate("/vendor/menu")}
            className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Manage Menu
          </button>

        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard title="Revenue" value={`₹${overview?.revenue || 0}`} icon={<FaDollarSign />} color="bg-orange-100 text-orange-500" />
        <StatCard title="Orders" value={overview?.totalOrders || 0} icon={<FaClipboardList />} color="bg-blue-100 text-blue-500" />
        <StatCard title="Prep Time" value={`${overview?.avgPrepTime || 0} min`} icon={<FaBox />} color="bg-green-100 text-green-500" />
        <StatCard title="Rating" value={`⭐ ${overview?.rating?.toFixed(1) || 0}`} icon={<FaUsers />} color="bg-purple-100 text-purple-500" />

      </div>

      {/* MENU */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Menu Quick View</h2>

          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600"
          >
            + Add New Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm">

            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Dish</th>
                <th>Category</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>

            <tbody>
              {menu.slice(0, 5).map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{item.name}</td>
                  <td>{item.category?.name || "N/A"}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${item.isAvailable ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {item.isAvailable ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>₹{item.price}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            <h2 className="text-lg font-semibold mb-4">Add Menu Item</h2>

            <input placeholder="Name" className="w-full border p-2 mb-2 rounded"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <input type="number" placeholder="Price" className="w-full border p-2 mb-2 rounded"
              onChange={(e) => setForm({ ...form, price: e.target.value })} />

            <input placeholder="Category" className="w-full border p-2 mb-2 rounded"
              onChange={(e) => setForm({ ...form, category: e.target.value })} />

            <input type="file" className="mb-3"
              onChange={(e) => setImage(e.target.files[0])} />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="border px-3 py-1 rounded">Cancel</button>
              <button onClick={handleCreate} className="bg-orange-500 text-white px-3 py-1 rounded">Save</button>
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
        <h2 className="text-xl font-bold">{value}</h2>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  );
}

export default Dashboard;