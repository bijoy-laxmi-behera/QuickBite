import { useState } from "react";

const initialUsers = [
  { id: 1, name: "Anjali Sharma", email: "anjali@gmail.com", role: "customer", status: "active", joined: "Jan 3, 2025", orders: 14 },
  { id: 2, name: "Rahul Mehta", email: "rahul@gmail.com", role: "vendor", status: "active", joined: "Dec 18, 2024", orders: 0 },
  { id: 3, name: "Priya Singh", email: "priya@gmail.com", role: "customer", status: "suspended", joined: "Nov 22, 2024", orders: 6 },
  { id: 4, name: "Karan Das", email: "karan@gmail.com", role: "delivery", status: "active", joined: "Jan 10, 2025", orders: 0 },
  { id: 5, name: "Sneha Roy", email: "sneha@gmail.com", role: "customer", status: "active", joined: "Jan 12, 2025", orders: 3 },
  { id: 6, name: "Vikram Nair", email: "vikram@gmail.com", role: "vendor", status: "pending", joined: "Jan 14, 2025", orders: 0 },
];

const roleBadge = {
  customer: "bg-blue-100 text-blue-700",
  vendor: "bg-purple-100 text-purple-700",
  delivery: "bg-yellow-100 text-yellow-700",
  admin: "bg-red-100 text-red-700",
};

const statusBadge = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-600",
  pending: "bg-orange-100 text-orange-600",
};

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">User Management</h2>
        <p className="text-gray-500 text-sm mt-1">{users.length} total registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleBadge[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{user.joined}</td>
                  <td className="px-5 py-4 text-gray-700 font-medium">{user.orders}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        user.status === "active"
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {user.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
        )}
      </div>
    </div>
  );
}