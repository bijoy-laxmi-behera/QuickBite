import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

function FoodCard({ dish, toggleStatus, deleteDish, editDish }) {

  const [loading, setLoading] = useState(false);

  // ✅ DELETE WITH TOAST CONFIRM
  const handleDelete = () => {
    toast.custom(
      (t) => (
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3 pointer-events-auto">

          <p className="text-sm font-medium">
            Delete this dish?
          </p>

          <div className="flex justify-end gap-2">

            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 border rounded text-sm"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                try {
                  setLoading(true);

                  await deleteDish(dish._id);

                  toast.success("Deleted successfully");
                } catch {
                  toast.error("Delete failed");
                } finally {
                  setLoading(false);
                  toast.dismiss(t.id);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Confirm
            </button>

          </div>
        </div>
      ),
      {
        duration: 5000,
      }
    );
  };

  // ✅ TOGGLE
  const handleToggle = async () => {
    try {
      setLoading(true);
      await toggleStatus(dish._id);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition duration-300">

      {/* IMAGE */}
      <div className="relative">
        <img
          src={dish.image || "/placeholder.jpg"}
          alt={dish.name}
          className="w-full h-40 object-cover"
        />

        {/* STATUS BADGE */}
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
            dish.isAvailable
              ? "bg-green-100 text-green-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {dish.isAvailable ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="p-4">

        {/* NAME + PRICE */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            {dish.name}
          </h3>
          <span className="text-orange-500 font-semibold">
            ₹{dish.price}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
          {dish.description || "No description"}
        </p>

        {/* ORDER TYPE */}
        <p className="text-xs text-gray-400 mt-2">
          {dish.orderType || "Standard"}
        </p>

        {/* TOGGLE */}
        <div className="flex items-center justify-between mt-4">

          <label className="flex items-center cursor-pointer">

            <input
              type="checkbox"
              checked={dish.isAvailable}
              onChange={handleToggle}
              className="hidden"
              disabled={loading}
            />

            <div
              className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                dish.isAvailable ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                  dish.isAvailable ? "translate-x-5" : ""
                }`}
              />
            </div>

          </label>

          <span className="text-xs text-gray-500">
            {loading
              ? "Updating..."
              : dish.isAvailable
              ? "Available"
              : "Hidden"}
          </span>

        </div>

        {/* ACTIONS */}
        <div className="flex justify-between mt-4 relative z-10">

          <button
            onClick={() => editDish(dish)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500"
          >
            <FaEdit /> Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
          >
            <FaTrash /> {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default FoodCard;