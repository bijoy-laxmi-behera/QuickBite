import RestaurantCard from "./RestaurantCard";
import spiceKitchen from "../../assets/restaurants/spice-kitchen.jpg";
import biryaniHub from "../../assets/restaurants/biryani-hub.jpg";
import chineseWok from "../../assets/restaurants/chinese-wok.jpg";
import dailyTiffin from "../../assets/restaurants/daily-tiffin.jpg";
import greenBowl from "../../assets/restaurants/green-bowl.jpg";
import pizzaTown from "../../assets/restaurants/pizza-town.jpg";
const restaurantData = [
  {
    id: 1,
    name: "Spice Kitchen",
    type: "Restaurant",
    rating: "4.5",
    image: spiceKitchen,
    items: [
      {
        id: 101,
        name: "Paneer Butter Masala",
        price: 180,
        category: "Main Course",
        type: "veg"
      },
      {
        id: 102,
        name: "Dal Makhani",
        price: 160,
        category: "Main Course",
        type: "veg"
      },
      {
        id: 103,
        name: "Paneer Tikka",
        price: 200,
        category: "Starter",
        type: "veg"
      }
    ],
  },

  {
    id: 2,
    name: "Biryani Hub",
    type: "Cloud Kitchen",
    rating: "4.7",
    image: biryaniHub,
    items: [
      {
        id: 201,
        name: "Chicken Biryani",
        price: 220,
        category: "Main Course",
        type: "non-veg"
      },
      {
        id: 202,
        name: "Mutton Biryani",
        price: 280,
        category: "Main Course",
        type: "non-veg"
      },
      {
        id: 203,
        name: "Chicken Starter",
        price: 190,
        category: "Starter",
        type: "non-veg"
      }
    ],
  },

  {
    id: 3,
    name: "Pizza Town",
    type: "Restaurant",
    rating: "4.3",
    image: pizzaTown,
    items: [
      {
        id: 301,
        name: "Margherita",
        price: 250,
        category: "Main Course",
        type: "veg"
      },
      {
        id: 302,
        name: "Farmhouse Pizza",
        price: 320,
        category: "Main Course",
        type: "veg"
      },
      {
        id: 303,
        name: "Garlic Bread",
        price: 120,
        category: "Starter",
        type: "veg"
      }
    ],
  },

  {
    id: 4,
    name: "Green Bowl",
    type: "Cloud Kitchen",
    rating: "4.4",
    image: greenBowl,
    items: [
      {
        id: 401,
        name: "Veg Bowl",
        price: 150,
        category: "Combos",
        type: "veg"
      },
      {
        id: 402,
        name: "Salad Mix",
        price: 130,
        category: "Starter",
        type: "veg"
      }
    ],
  },

  {
    id: 5,
    name: "Daily Tiffin",
    type: "Cloud Kitchen",
    rating: "4.2",
    image: dailyTiffin,
    items: [
      {
        id: 501,
        name: "Home Thali",
        price: 120,
        category: "Combos",
        type: "veg"
      },
      {
        id: 502,
        name: "Mini Meal",
        price: 100,
        category: "Combos",
        type: "veg"
      }
    ],
  },

  {
    id: 6,
    name: "Chinese Wok",
    type: "Cloud Kitchen",
    rating: "4.1",
    image: chineseWok,
    items: [
      {
        id: 601,
        name: "Hakka Noodles",
        price: 140,
        category: "Main Course",
        type: "veg"
      },
      {
        id: 602,
        name: "Manchurian",
        price: 160,
        category: "Starter",
        type: "veg"
      }
    ],
  }
];
function Recommended({ setPage, setSelectedRestaurant, setFavourites }) {

  return (
    <div className="mt-6 px-4">

      <h2 className="text-xl font-bold mb-4">
        🍽️ Restaurants For You
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {restaurantData.map((res) => (
          <RestaurantCard
            key={res.id}
            restaurant={res}
            setPage={setPage}
            setSelectedRestaurant={setSelectedRestaurant}
            setFavourites={setFavourites}
          />
        ))}

      </div>

    </div>
  );
}

export default Recommended;