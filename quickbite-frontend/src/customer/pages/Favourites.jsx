import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  // 🔁 Load favourites
  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("favourites")) || [];
    setFavourites(saved);
  }, []);

  const openRestaurant = (restaurant) => {
    navigate("/customer/restaurant", {
      state: { restaurant }
    });
  };

  if (favourites.length === 0) {
    return (
      <p className="p-6 text-gray-500">
        No favourites yet ❤️
      </p>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">

      {favourites.map((res) => (
        <div
          key={res.id}
          onClick={() => openRestaurant(res)}
          className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <img
            src={res.image}
            alt={res.name}
            className="h-32 w-full object-cover rounded"
          />

          <h3 className="mt-2 font-semibold">
            {res.name}
          </h3>
        </div>
      ))}

    </div>
  );
}

export default Favourites;