import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

function Restaurant() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart, setCart } = useCart();

  const restaurant = location.state?.restaurant;

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ Load data
  useEffect(() => {
    if (!restaurant) return;

    if (restaurant.items) {
      setMenu([
        {
          category: "All",
          items: restaurant.items,
        },
      ]);
      setLoading(false);
    }
  }, [restaurant]);

  // ❌ Refresh case
  if (!restaurant) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">No restaurant selected</p>

        <button
          onClick={() => navigate("/customer/home")}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading menu...</div>;
  }

  // ✅ Flatten
  const allItems = menu.flatMap((cat) => cat.items || []);

  // ✅ Filter
  const filteredItems = allItems.filter((item) => {
    const categoryMatch =
      activeCategory === "All" || item.category === activeCategory;

    const vegMatch = !vegOnly || item.type === "veg";

    const searchMatch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return categoryMatch && vegMatch && searchMatch;
  });

  // ✅ Add to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);

      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold mb-2">
        {restaurant.name}
      </h1>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search dishes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* 🍽 ITEMS */}
      {filteredItems.length === 0 ? (
        <p className="text-gray-500">No items found</p>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="border p-3 mb-2 rounded">

            <h3>{item.name}</h3>
            <p>₹{item.price}</p>

            <button
              onClick={() => addToCart(item)}
              className="bg-orange-500 text-white px-3 py-1 rounded mt-2"
            >
              Add
            </button>

          </div>
        ))
      )}

    </div>
  );
}

export default Restaurant;