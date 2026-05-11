// frontend/src/admin/pages/RestaurantsPage.jsx

import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  MoreVertical,
  Trash2,
  Edit,
  Store,
  MapPin,
  Clock,
} from "lucide-react";

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending");
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
        ...(options.headers || {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API Error");
    }

    return data;
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchAllData();
  }, []);

  // FETCH EVERYTHING
  const fetchAllData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchRestaurants(),
        fetchPendingRestaurants(),
      ]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // FETCH ALL RESTAURANTS
  const fetchRestaurants = async () => {
    try {
      const data = await fetchWithAuth("/admin/restaurants");

      setRestaurants(data.data || []);
    } catch (err) {
      console.log(err);
      setRestaurants([]);
    }
  };

  // FETCH PENDING
  const fetchPendingRestaurants = async () => {
    try {
      const data = await fetchWithAuth(
        "/admin/restaurants/pending"
      );

      console.log("Pending restaurants:", data);

      setPendingRestaurants(data.data || []);
    } catch (err) {
      console.log(err);
      setPendingRestaurants([]);
    }
  };

  // APPROVE
  const handleApprove = async (id) => {
    try {
      await fetchWithAuth(
        `/admin/restaurants/${id}/approve`,
        {
          method: "PATCH",
        }
      );

      await fetchAllData();
    } catch (err) {
      console.log(err);
    }
  };

  // REJECT
  const handleReject = async (id) => {
    try {
      await fetchWithAuth(
        `/admin/restaurants/${id}/reject`,
        {
          method: "PATCH",
        }
      );

      await fetchAllData();
    } catch (err) {
      console.log(err);
    }
  };

  // FILTER
  const filteredRestaurants = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOADING
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Restaurants Management
        </h1>

        <p className="text-gray-500 mt-1">
          Manage restaurant approvals and listings
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200">

        {/* PENDING */}
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-1 font-medium flex items-center gap-2 transition ${
            activeTab === "pending"
              ? "border-b-2 border-orange-500 text-orange-600"
              : "text-gray-500"
          }`}
        >
          <AlertCircle size={18} />

          Pending Approval

          {pendingRestaurants.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
              {pendingRestaurants.length}
            </span>
          )}
        </button>

        {/* ALL */}
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-1 font-medium transition ${
            activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          All Restaurants
        </button>
      </div>

      {/* PENDING SECTION */}
      {activeTab === "pending" && (
        <div className="space-y-4">

          {/* TOP BAR */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {pendingRestaurants.length} restaurants waiting
              for approval
            </p>

            <button
              onClick={fetchPendingRestaurants}
              className="flex items-center gap-1 text-orange-500 text-sm hover:text-orange-600"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* EMPTY */}
          {pendingRestaurants.length === 0 ? (
            <div className="bg-white rounded-2xl border p-10 text-center">
              <CheckCircle
                size={50}
                className="mx-auto text-green-500 mb-4"
              />

              <h3 className="text-lg font-semibold text-gray-700">
                No Pending Restaurants
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                All restaurants are reviewed.
              </p>
            </div>
          ) : (
            pendingRestaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex-1 space-y-4">

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Store className="text-orange-500" />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {restaurant.name}
                        </h2>

                        <p className="text-sm text-orange-500">
                          {restaurant.type || "Restaurant"}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm">
                      {restaurant.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">

                      <div className="flex items-center gap-2">
                        <Clock size={15} />
                        {restaurant.deliveryTime || 30} mins
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        {restaurant.address?.city ||
                          restaurant.city ||
                          "N/A"}
                      </div>

                      <div>
                        🍽{" "}
                        {Array.isArray(restaurant.cuisine)
                          ? restaurant.cuisine.join(", ")
                          : restaurant.cuisine}
                      </div>

                      <div>
                        💰 ₹
                        {restaurant.minOrderAmount || 100}
                      </div>
                    </div>

                    {/* OWNER */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Vendor Information
                      </h4>

                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          {restaurant.owner?.name}
                        </p>

                        <p>
                          {restaurant.owner?.email}
                        </p>

                        <p>
                          {restaurant.owner?.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        handleApprove(restaurant._id)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleReject(restaurant._id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ALL RESTAURANTS */}
      {activeTab === "all" && (
        <div className="space-y-4">

          {/* SEARCH */}
          <div className="bg-white p-4 rounded-xl border">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border overflow-hidden">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4">Restaurant</th>
                  <th className="text-left p-4">Cuisine</th>
                  <th className="text-left p-4">City</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRestaurants.map((restaurant) => (
                  <tr
                    key={restaurant._id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4 font-medium">
                      {restaurant.name}
                    </td>

                    <td className="p-4">
                      {Array.isArray(restaurant.cuisine)
                        ? restaurant.cuisine.join(", ")
                        : restaurant.cuisine}
                    </td>

                    <td className="p-4">
                      {restaurant.address?.city ||
                        restaurant.city ||
                        "N/A"}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500"
                        />

                        {restaurant.rating || 4.5}
                      </div>
                    </td>

                    <td className="p-4">
                      {restaurant.isApproved ? (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Approved
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right relative">
                      <button
                        onClick={() =>
                          setShowActions(
                            showActions === restaurant._id
                              ? null
                              : restaurant._id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showActions === restaurant._id && (
                        <div className="absolute right-4 mt-2 w-40 bg-white border rounded-xl shadow-lg z-20">

                          <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                            <Edit size={16} />
                            Edit
                          </button>

                          <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 size={16} />
                            Delete
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
      )}
    </div>
  );
};

export default RestaurantsPage;