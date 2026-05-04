import { useState } from "react";

const initialVendors = [
  { id: 1, name: "Spice Garden", owner: "Rahul Mehta", email: "rahul@spicegarden.com", city: "Bhubaneswar", category: "Indian", status: "approved", meals: 12, rating: 4.7, revenue: "₹38,200" },
  { id: 2, name: "GreenLeaf", owner: "Meena Iyer", email: "meena@greenleaf.com", city: "Cuttack", category: "Healthy", status: "approved", meals: 8, rating: 4.5, revenue: "₹21,600" },
  { id: 3, name: "Desi Dhaba", owner: "Suresh Rao", email: "suresh@desidhaba.com", city: "Puri", category: "Indian", status: "pending", meals: 15, rating: 4.2, revenue: "₹0" },
  { id: 4, name: "Pizza Palace", owner: "Vikram Nair", email: "vikram@pizza.com", city: "Bhubaneswar", category: "Fast Food", status: "pending", meals: 10, rating: 0, revenue: "₹0" },
  { id: 5, name: "The Wrap Co.", owner: "Leela Das", email: "leela@wrap.com", city: "Rourkela", category: "Continental", status: "suspended", meals: 7, rating: 3.9, revenue: "₹8,400" },
];

const statusConfig = {
  approved: { cls: "bg-green-100 text-green-700", label: "Approved" },
  pending: { cls: "bg-yellow-100 text-yellow-700", label: "Pending" },
  suspended: { cls: "bg-red-100 text-red-600", label: "Suspended" },
};

export default function VendorManagement() {
  const [vendors, setVendors] = useState(initialVendors);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = vendors.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id, newStatus) => {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: newStatus } : v));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Vendor Management</h2>
        <p className="text-gray-500 text-sm mt-1">{vendors.filter(v => v.status === "pending").length} vendors awaiting approval</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Vendors", value: vendors.length, color: "text-gray-800" },
          { label: "Active", value: vendors.filter(v => v.status === "approved").length, color: "text-green-600" },
          { label: "Pending Review", value: vendors.filter(v => v.status === "pending").length, color: "text-yellow-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by vendor name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-lg font-bold">
                  {vendor.name[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{vendor.name}</p>
                  <p className="text-xs text-gray-400">{vendor.owner} · {vendor.city}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[vendor.status].cls}`}>
                {statusConfig[vendor.status].label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-xl p-3 text-center">
              <div>
                <p className="text-base font-bold text-gray-800">{vendor.meals}</p>
                <p className="text-xs text-gray-500">Meal Plans</p>
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{vendor.rating > 0 ? vendor.rating : "—"}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{vendor.revenue}</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>

            <div className="flex gap-2">
              {vendor.status === "pending" && (
                <button
                  onClick={() => updateStatus(vendor.id, "approved")}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  ✓ Approve
                </button>
              )}
              {vendor.status === "approved" && (
                <button
                  onClick={() => updateStatus(vendor.id, "suspended")}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Suspend
                </button>
              )}
              {vendor.status === "suspended" && (
                <button
                  onClick={() => updateStatus(vendor.id, "approved")}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  Reinstate
                </button>
              )}
              {vendor.status === "pending" && (
                <button
                  onClick={() => updateStatus(vendor.id, "suspended")}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  ✕ Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}