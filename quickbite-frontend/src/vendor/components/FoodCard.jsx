import { FaEdit, FaTrash } from "react-icons/fa";

function FoodCard({ dish, toggleStatus, deleteDish, editDish }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">

      {/* Dish Image */}
      <img
        src={dish.image}
        alt={dish.name}
        className="w-full h-40 object-cover"
      />

      {/* Content */}
      <div className="p-4">

        {/* Dish name + price */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{dish.name}</h3>
          <span className="text-orange-500 font-semibold">
            ₹{dish.price}
          </span>
        </div>

        <p className="text-gray-500 text-sm mt-1">
          {dish.description}
        </p>

        {/* Status badge + order type */}
        <div className="flex justify-between items-center mt-3">

          <span
            className={`text-xs px-2 py-1 rounded-full ${
              dish.status === "Active"
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {dish.status}
          </span>

          <span className="text-xs text-gray-500">
            {dish.orderType}
          </span>

        </div>


        {/* Toggle Switch */}
        <div className="flex items-center justify-between mt-4">

          <label className="flex items-center cursor-pointer">

            <input
              type="checkbox"
              checked={dish.status === "Active"}
              onChange={() => toggleStatus(dish.id)}
              className="hidden"
            />

            <div
              className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                dish.status === "Active"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                  dish.status === "Active"
                    ? "translate-x-5"
                    : ""
                }`}
              ></div>
            </div>

          </label>

          <span className="text-xs text-gray-500">
            {dish.status === "Active" ? "Available" : "Hidden"}
          </span>

        </div>


        {/* Actions */}
        <div className="flex justify-between mt-4">

          <button
            onClick={() => editDish(dish)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-orange-500"
          >
            <FaEdit /> Edit
          </button>

          <button
            onClick={() => deleteDish(dish.id)}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
          >
            <FaTrash /> Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default FoodCard;