function FoodCard({ item, setCart }) {

  const handleAdd = () => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);

      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition flex justify-between items-center">

  <div>
    <h3 className="font-semibold text-lg">{item.name}</h3>

    <p className="text-sm text-gray-500">{item.category}</p>

    <p className="mt-1 font-bold text-orange-500">
      ₹{item.price}
    </p>
  </div>

  <div className="text-right">

    <img
      src={item.image || restaurant.image}
      className="w-24 h-24 rounded-lg object-cover mb-2"
    />

    <button className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition">
      Add
    </button>

  </div>
</div>
  );
}

export default FoodCard;