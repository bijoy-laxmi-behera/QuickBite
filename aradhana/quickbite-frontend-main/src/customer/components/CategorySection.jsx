// src/customer/components/CategorySection.jsx

import all from "../../assets/categories/all.png";
import pizza from "../../assets/categories/pizza.png";
import biryani from "../../assets/categories/biryani.png";
import burger from "../../assets/categories/burger.png";
import cake from "../../assets/categories/cake.png";
import chicken from "../../assets/categories/chicken.png";
import coffee from "../../assets/categories/coffee.png";
import dessert from "../../assets/categories/dessert.png";
import dosa from "../../assets/categories/dosa.png";
import egg from "../../assets/categories/egg.png";
import fish from "../../assets/categories/fish.png";
import fried from "../../assets/categories/friedrice.png";
import greensalad from "../../assets/categories/greensalad.png";
import juice from "../../assets/categories/juice.png";
import mealbox from "../../assets/categories/mealbox.png";
import noodles from "../../assets/categories/noodles.png";
import paneer from "../../assets/categories/paneer.png";
import pasta from "../../assets/categories/pasta.png";
import roti from "../../assets/categories/roti.png";
import tiffin from "../../assets/categories/tiffin.png";

const categories = [
  { name: "All",       img: all },
  { name: "Pizza",     img: pizza },
  { name: "Biryani",   img: biryani },
  { name: "Burger",    img: burger },
  { name: "Cake",      img: cake },
  { name: "Chicken",   img: chicken },
  { name: "Coffee",    img: coffee },
  { name: "Dessert",   img: dessert },
  { name: "Dosa",      img: dosa },
  { name: "Egg",       img: egg },
  { name: "Fish",      img: fish },
  { name: "Fried Rice",img: fried },
  { name: "Healthy",   img: greensalad },
  { name: "Juice",     img: juice },
  { name: "Meal Box",  img: mealbox },
  { name: "Noodles",   img: noodles },
  { name: "Paneer",    img: paneer },
  { name: "Pasta",     img: pasta },
  { name: "Roti",      img: roti },
  { name: "Tiffin",    img: tiffin },
];

function CategorySection({
  activeCategory = "All",
  setActiveCategory = () => {},
}) {
  return (
    <div className="mb-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-800">
          Explore Category
        </h2>
        <button className="text-xs sm:text-sm text-orange-500 font-semibold hover:underline">
          See All
        </button>
      </div>

      {/* SCROLL CONTAINER */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-1 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className="flex flex-col items-center shrink-0 group focus:outline-none"
              style={{ minWidth: "68px" }}
            >
              {/* ICON BUBBLE */}
              <div
                className={`
                  w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl
                  flex items-center justify-center
                  transition-all duration-300
                  ${isActive
                    ? "bg-gradient-to-br from-orange-400 to-yellow-400 shadow-lg shadow-orange-200 scale-110 ring-2 ring-orange-300"
                    : "bg-white shadow-sm hover:shadow-md hover:scale-105 group-hover:ring-1 group-hover:ring-orange-200"
                  }
                `}
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className={`object-contain transition-all duration-300 ${isActive ? "w-9 h-9 sm:w-10 sm:h-10" : "w-8 h-8 sm:w-10 sm:h-10"}`}
                />
              </div>

              {/* LABEL */}
              <p
                className={`
                  text-[11px] sm:text-xs mt-1.5 text-center font-semibold leading-tight transition-colors
                  ${isActive ? "text-orange-500" : "text-gray-500 group-hover:text-gray-700"}
                `}
              >
                {cat.name}
              </p>

              {/* ACTIVE DOT */}
              {isActive && (
                <span className="w-1 h-1 bg-orange-500 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySection;
