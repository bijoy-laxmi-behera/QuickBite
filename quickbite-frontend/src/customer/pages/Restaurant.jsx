import { useState, useEffect } from "react";

function Restaurant({ restaurant, setCart, cart, setPage }) {

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ FETCH FROM BACKEND
 useEffect(() => {
  if (!restaurant) return;

  // ❌ REMOVE BACKEND CALL FOR NOW
  // fetch(...)

  // ✅ USE LOCAL DATA
  if (restaurant.items) {
    setMenu([
      {
        category: "All",
        items: restaurant.items
      }
    ]);
    setLoading(false);
  }

}, [restaurant]);

  if (!restaurant) {
    return <div className="p-6">No restaurant selected</div>;
  }

  if (loading) {
    return <div className="p-6">Loading menu...</div>;
  }

  // ✅ FLATTEN MENU (because backend sends category-wise)
  const allItems = Array.isArray(menu)
  ? menu.flatMap(cat => cat.items || [])
  : restaurant.items || [];

  const filteredItems = allItems.filter(item => {
    const categoryMatch =
      activeCategory === "All" || item.category === activeCategory;

    const vegMatch =
      !vegOnly || item.type === "veg";

    const searchMatch =
      item.name.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && vegMatch && searchMatch;
  });

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-2">
        {restaurant.name}
      </h1>

      {/* SEARCH */}
      <input
        placeholder="Search dishes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* ITEMS */}
      {filteredItems.map(item => (
        <div key={item._id} className="border p-3 mb-2 rounded">

          <h3>{item.name}</h3>
          <p>₹{item.price}</p>

          <button
            onClick={() =>
              setCart(prev => [...prev, { ...item, qty: 1 }])
            }
            className="bg-orange-500 text-white px-3 py-1 rounded mt-2"
          >
            Add
          </button>

        </div>
      ))}

    </div>
  );
}

export default Restaurant;