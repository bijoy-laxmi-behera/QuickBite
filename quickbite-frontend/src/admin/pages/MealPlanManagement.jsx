import { useState } from "react";

const initialMeals = [
  { id: 1, name: "Grilled Chicken Bowl", vendor: "Spice Garden", category: "Non-Veg", price: 380, calories: 520, status: "active", orders: 412, tags: ["High Protein", "Keto"] },
  { id: 2, name: "Paneer Butter Masala", vendor: "Spice Garden", category: "Veg", price: 290, calories: 480, status: "active", orders: 389, tags: ["Veg", "Comfort Food"] },
  { id: 3, name: "Fruit & Nut Salad", vendor: "GreenLeaf", category: "Veg", price: 210, calories: 220, status: "active", orders: 211, tags: ["Low Calorie", "Healthy"] },
  { id: 4, name: "Egg Fried Rice", vendor: "GreenLeaf", category: "Egg", price: 190, calories: 410, status: "active", orders: 298, tags: ["Quick", "Filling"] },
  { id: 5, name: "Veg Thali Combo", vendor: "Desi Dhaba", category: "Veg", price: 250, calories: 650, status: "inactive", orders: 342, tags: ["Veg", "Value"] },
  { id: 6, name: "Mutton Curry Bowl", vendor: "Spice Garden", category: "Non-Veg", price: 420, calories: 590, status: "inactive", orders: 88, tags: ["Premium", "Spicy"] },
];

const catColor = {
  Veg: "bg-green-100 text-green-700",
  "Non-Veg": "bg-red-100 text-red-600",
  Egg: "bg-yellow-100 text-yellow-700",
};

export default function MealPlanManagement() {
  const [meals, setMeals] = useState(initialMeals);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = meals.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.vendor.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || m.category === catFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const toggleStatus = (id) => {
    setMeals((prev) =>
      prev.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m)
    );
  };

  const removeMeal = (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Meal Plan Management</h2>
          <p className="text-gray-500 text-sm mt-1">{meals.filter(m => m.status === "active").length} active meal plans</p>
        </div>
        <button className="px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
          + Add Meal Plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search meal plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
          <option value="all">All Categories</option>
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
          <option value="Egg">Egg</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Meal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((meal) => (
          <div key={meal.id} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${meal.status === "inactive" ? "opacity-60 border-gray-200" : "border-gray-100"}`}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-800 leading-tight">{meal.name}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${catColor[meal.category]}`}>
                {meal.category}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-3">by {meal.vendor}</p>

            <div className="flex gap-1 flex-wrap mb-3">
              {meal.tags.map((tag) => (
                <span key={tag} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 text-center mb-4">
              <div>
                <p className="text-sm font-bold text-gray-800">₹{meal.price}</p>
                <p className="text-xs text-gray-500">Price</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{meal.calories}</p>
                <p className="text-xs text-gray-500">kcal</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{meal.orders}</p>
                <p className="text-xs text-gray-500">Orders</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(meal.id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  meal.status === "active"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {meal.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => removeMeal(meal.id)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No meal plans found.</div>
      )}
    </div>
  );
}
