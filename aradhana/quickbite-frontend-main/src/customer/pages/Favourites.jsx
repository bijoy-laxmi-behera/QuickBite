import { FaHeart, FaStar, FaClock, FaMotorcycle } from "react-icons/fa";

function Favourites({ favourites = [], setPage, setSelectedRestaurant }) {

  if (!favourites || favourites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <FaHeart className="text-4xl text-red-200" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-1">No favourites yet</h2>
        <p className="text-gray-400 text-sm mb-6">
          Tap the ❤️ on any restaurant or dish to save it here
        </p>
        <button
          onClick={() => setPage("home")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold transition shadow-lg"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-5">
          <FaHeart className="text-red-500" />
          <h2 className="text-xl font-extrabold text-gray-800">My Favourites</h2>
          <span className="ml-auto text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full font-semibold">
            {favourites.length} saved
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favourites.map((res) => {
            const deliveryTime = Math.round(20 + (5 - parseFloat(res.rating || 4)) * 6);
            return (
              <div
                key={res.id}
                onClick={() => {
                  if (setSelectedRestaurant) setSelectedRestaurant(res);
                  if (setPage) setPage("restaurant");
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
              >
                {/* IMAGE */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={res.image}
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* FAVOURITE BADGE */}
                  <div className="absolute top-2.5 right-2.5 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md">
                    <FaHeart className="text-xs" />
                  </div>

                  {/* TYPE */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${res.type === "Cloud Kitchen" ? "bg-purple-600 text-white" : "bg-green-600 text-white"}`}>
                      {res.type}
                    </span>
                  </div>

                  {/* RATING + TIME */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-lg shadow">
                      <FaStar className="text-yellow-400 text-[10px]" /> {res.rating}
                    </div>
                    <div className="flex items-center gap-1 bg-white/90 text-gray-700 text-[10px] font-semibold px-2 py-1 rounded-lg shadow">
                      <FaClock className="text-orange-400 text-[10px]" /> {deliveryTime} min
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-800 truncate">{res.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {res.items ? [...new Set(res.items.map((i) => i.category))].join(" • ") : "Various cuisines"}
                  </p>
                  <div className="border-t border-dashed border-gray-100 my-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <FaMotorcycle className="text-orange-400 text-xs" /> Free Delivery
                    </div>
                    <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      {res.items ? res.items.length : "?"} Items
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Favourites;