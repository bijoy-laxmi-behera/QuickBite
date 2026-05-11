import { useState, useEffect } from "react";
import { FaHeart, FaStar, FaClock, FaMotorcycle, FaTrash, FaSpinner } from "react-icons/fa";
import API from "../../services/axios";

function Favourites({ favourites = [], setFavourites, setPage, setSelectedRestaurant }) {
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [localFavourites, setLocalFavourites] = useState([]);

  // Fetch favourites from backend on mount
  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get("/customer/me/favourites");
        
        console.log("Favourites API Response:", response.data); // Debug log
        
        if (response.data.success) {
          const favouritesData = response.data.data || [];
          
          // Log the raw data to see what backend returns
          console.log("Raw favourites data:", favouritesData);
          
          // Transform backend data to match component format
          const transformedFavourites = favouritesData.map((item) => {
            // Handle different possible data structures
            const restaurant = item.restaurant || item;
            
            return {
              id: item._id || restaurant._id,
              _id: item._id || restaurant._id,
              name: restaurant.name || item.name || "Restaurant",
              type: restaurant.type || "Restaurant",
              rating: restaurant.rating || "4.2",
              image: restaurant.logo || restaurant.image || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80",
              items: restaurant.items || [],
              cuisine: restaurant.cuisine || "Various Cuisines",
              isFavourite: true
            };
          });
          
          console.log("Transformed favourites:", transformedFavourites);
          
          setLocalFavourites(transformedFavourites);
          
          // Update parent state if setFavourites exists
          if (setFavourites && typeof setFavourites === 'function') {
            setFavourites(transformedFavourites);
          }
        } else {
          console.error("API returned success false:", response.data);
        }
      } catch (error) {
        console.error("Error fetching favourites:", error);
        console.error("Error details:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [setFavourites]);

  // Remove from favourites
  const handleRemoveFavourite = async (e, restaurantId) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to manage favourites");
      window.location.href = "/login";
      return;
    }

    setRemovingId(restaurantId);
    
    try {
      const response = await API.delete(`/customer/me/favourites/${restaurantId}`);
      
      if (response.data.success) {
        // Update local state
        setLocalFavourites(prev => prev.filter(fav => fav.id !== restaurantId && fav._id !== restaurantId));
        
        // Update parent state if setFavourites exists
        if (setFavourites && typeof setFavourites === 'function') {
          setFavourites(prev => prev.filter(fav => fav.id !== restaurantId && fav._id !== restaurantId));
        }
        
        alert("Removed from favourites");
      }
    } catch (error) {
      console.error("Error removing favourite:", error);
      alert(error.response?.data?.message || "Failed to remove from favourites");
    } finally {
      setRemovingId(null);
    }
  };

  // Use local favourites if available, otherwise use props
  const displayFavourites = localFavourites.length > 0 ? localFavourites : favourites;

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
        <FaSpinner className="text-4xl text-orange-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Loading your favourites...</p>
      </div>
    );
  }

  if (!displayFavourites || displayFavourites.length === 0) {
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
          onClick={() => setPage && setPage("home")}
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
            {displayFavourites.length} saved
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayFavourites.map((res) => {
            const deliveryTime = Math.round(20 + (5 - parseFloat(res.rating || 4)) * 6);
            const restaurantId = res.id || res._id;
            
            return (
              <div
                key={restaurantId}
                onClick={() => {
                  if (setSelectedRestaurant) setSelectedRestaurant(res);
                  if (setPage) setPage("restaurant");
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 relative"
              >
                {/* IMAGE */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={res.image || "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80"}
                    alt={res.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* FAVOURITE BADGE with remove button */}
                  <button
                    onClick={(e) => handleRemoveFavourite(e, restaurantId)}
                    disabled={removingId === restaurantId}
                    className="absolute top-2.5 right-2.5 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {removingId === restaurantId ? (
                      <FaSpinner className="text-xs animate-spin" />
                    ) : (
                      <FaHeart className="text-xs" />
                    )}
                  </button>

                  {/* TYPE */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${res.type === "Cloud Kitchen" ? "bg-purple-600 text-white" : "bg-green-600 text-white"}`}>
                      {res.type || "Restaurant"}
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
                    {res.cuisine || "Various cuisines"}
                  </p>
                  <div className="border-t border-dashed border-gray-100 my-2" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <FaMotorcycle className="text-orange-400 text-xs" /> Free Delivery
                    </div>
                    <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      {res.items?.length || 0} Items
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