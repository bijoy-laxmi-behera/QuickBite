import { useState } from "react";
import FoodCard from "../components/FoodCard";
import AddDishModal from "../components/AddDishModal";

function MenuManagement() {

const [openModal, setOpenModal] = useState(false);
const [editingDish, setEditingDish] = useState(null);
const [search, setSearch] = useState("");

const [dishes, setDishes] = useState([
{
id: 1,
name: "Dal Rice",
price: 120,
description: "Simple home style dal rice meal",
status: "Active",
orderType: "Subscription",
image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0"
},
{
id: 2,
name: "Veg Thali",
price: 180,
description: "Roti, sabzi, dal and rice",
status: "Active",
orderType: "Both",
image: "https://images.unsplash.com/photo-1601050690597-df0568f70950"
},
{
id: 3,
name: "Paneer Bhurji",
price: 160,
description: "Healthy paneer protein meal",
status: "Inactive",
orderType: "One-time",
image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7"
}
]);

/* Toggle Active / Inactive */
const toggleStatus = (id) => {
setDishes(
dishes.map((dish) =>
dish.id === id
? { ...dish, status: dish.status === "Active" ? "Inactive" : "Active" }
: dish
)
);
};

/* Delete Dish */
const deleteDish = (id) => {
const confirmDelete = window.confirm("Delete this dish?");
if (confirmDelete) {
setDishes(dishes.filter((dish) => dish.id !== id));
}
};

/* Real-time search */
const filteredDishes = dishes.filter((dish) =>
dish.name.toLowerCase().includes(search.toLowerCase())
);

return ( <div className="p-6">


  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">

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
      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 mt-3 md:mt-0"
    >
      + Add New Item
    </button>

  </div>


  {/* Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">TOTAL ITEMS</p>
      <h2 className="text-xl font-bold mt-1">{dishes.length}</h2>
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">ACTIVE DISHES</p>
      <h2 className="text-xl font-bold text-green-500 mt-1">
        {dishes.filter((d) => d.status === "Active").length}
      </h2>
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">SUBSCRIBABLE</p>
      <h2 className="text-xl font-bold text-blue-500 mt-1">
        {dishes.filter((d) => d.orderType !== "One-time").length}
      </h2>
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">HIDDEN</p>
      <h2 className="text-xl font-bold text-yellow-500 mt-1">
        {dishes.filter((d) => d.status === "Inactive").length}
      </h2>
    </div>

  </div>


  {/* Search */}
  <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
    <input
      type="text"
      placeholder="Search dishes..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400"
    />
  </div>


  {/* Dish Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    {filteredDishes.map((dish) => (
      <FoodCard
        key={dish.id}
        dish={dish}
        toggleStatus={toggleStatus}
        deleteDish={deleteDish}
        editDish={(dish) => {
          setEditingDish(dish);
          setOpenModal(true);
        }}
      />
    ))}

    {/* Add Dish Card */}
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


  {/* Modal */}
  <AddDishModal
    isOpen={openModal}
    onClose={() => setOpenModal(false)}
    editingDish={editingDish}
  />

</div>


);
}

export default MenuManagement;
