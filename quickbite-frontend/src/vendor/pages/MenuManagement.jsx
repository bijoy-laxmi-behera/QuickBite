/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import API from "@/services/axios";
import toast from "react-hot-toast";

import FoodCard from "../components/FoodCard";
import AddDishModal from "../components/AddDishModal";

function MenuManagement() {
  const [openModal, setOpenModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [search, setSearch] = useState("");
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH MENU
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await API.get("/vendor/menu");
      setDishes(res.data.items);
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  /* TOGGLE AVAILABILITY */
  const toggleStatus = async (id) => {
    try {
      await API.patch(`/vendor/menu/${id}/availability`);

      setDishes((prev) =>
        prev.map((dish) =>
          dish._id === id
            ? { ...dish, isAvailable: !dish.isAvailable }
            : dish
        )
      );

      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /* DELETE DISH */
  const deleteDish = async (id) => {
    try {
      await API.delete(`/vendor/menu/${id}`);

      setDishes((prev) => prev.filter((dish) => dish._id !== id));

      toast.success("Dish deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* SEARCH FILTER */
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  // LOADING
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading menu...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">

        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-gray-500 text-sm">
            Easily update your dishes, prices and availability.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDish(null);
            setOpenModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 w-full md:w-auto"
        >
          + Add New Item
        </button>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <Stat title="Total Items" value={dishes.length} />

        <Stat
          title="Active"
          value={dishes.filter((d) => d.isAvailable).length}
          color="text-green-500"
        />

        <Stat
          title="Inactive"
          value={dishes.filter((d) => !d.isAvailable).length}
          color="text-red-500"
        />

        <Stat
          title="Avg Price"
          value={`₹${
            dishes.length
              ? Math.round(
                  dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length
                )
              : 0
          }`}
          color="text-blue-500"
        />

      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredDishes.map((dish) => (
          <FoodCard
            key={dish._id}
            dish={dish}
            toggleStatus={toggleStatus}
            deleteDish={deleteDish}
            editDish={(dish) => {
              setEditingDish(dish);
              setOpenModal(true);
            }}
          />
        ))}

        {/* ADD CARD */}
        <div
          onClick={() => {
            setEditingDish(null);
            setOpenModal(true);
          }}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center h-64 hover:border-orange-400 cursor-pointer"
        >
          <div className="text-center">
            <p className="text-4xl text-gray-400">+</p>
            <p className="text-gray-500 text-sm mt-2">Add New Dish</p>
          </div>
        </div>

      </div>

      {/* MODAL */}
      <AddDishModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchMenu(); // refresh after add/edit
        }}
        editingDish={editingDish}
      />

    </div>
  );
}

/* STAT CARD */
function Stat({ title, value, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-xl font-bold mt-1 ${color || ""}`}>
        {value}
      </h2>
    </div>
  );
}

export default MenuManagement;