// frontend/src/admin/pages/UsersPage.jsx

import React, { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showActions, setShowActions] = useState(null);

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  // FETCH WITH AUTH
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("API Failed");
    }

    return response.json();
  };

  // FETCH USERS
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await fetchWithAuth("/admin/users");

      setUsers(data.users || data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // BLOCK USER
  const handleBlock = async (id) => {
    try {
      await fetchWithAuth(`/admin/users/${id}/block`, {
        method: "PATCH",
      });

      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  // UNBLOCK USER
  const handleUnblock = async (id) => {
    try {
      await fetchWithAuth(`/admin/users/${id}/unblock`, {
        method: "PATCH",
      });

      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE USER
  const handleDelete = async (id) => {
    try {
      await fetchWithAuth(`/admin/users/${id}`, {
        method: "DELETE",
      });

      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  // FILTER
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Users Management
        </h1>

        <p className="text-gray-500">
          Total Users: {users.length}
        </p>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl border">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {user.name?.[0]?.toUpperCase()}
                    </div>

                    <div>
                      <p className="font-medium">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4">
                  {user.phone || "-"}
                </td>

                <td className="p-4 capitalize">
                  {user.role}
                </td>

                <td className="p-4">
                  {user.isBlocked ? (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                      Blocked
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </td>

                <td className="p-4 text-right relative">
                  <button
                    onClick={() =>
                      setShowActions(
                        showActions === user._id
                          ? null
                          : user._id
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {showActions === user._id && (
                    <div className="absolute right-4 mt-2 w-44 bg-white border rounded-xl shadow-lg z-20">

                      {user.isBlocked ? (
                        <button
                          onClick={() =>
                            handleUnblock(user._id)
                          }
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Unblock User
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleBlock(user._id)
                          }
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                        >
                          <Ban size={16} />
                          Block User
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDelete(user._id)
                        }
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete User
                      </button>

                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default UsersPage;