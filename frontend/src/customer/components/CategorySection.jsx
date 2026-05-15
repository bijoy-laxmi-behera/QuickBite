// src/customer/components/CategorySection.jsx
import { useEffect, useState } from "react";
import { FaUtensils } from "react-icons/fa";
import API from "../../services/axios";

// Local image map — used as fallback when category has no uploaded image
import all        from "../../assets/categories/all.png";
import pizza      from "../../assets/categories/pizza.png";
import biryani    from "../../assets/categories/biryani.png";
import burger     from "../../assets/categories/burger.png";
import cake       from "../../assets/categories/cake.png";
import chicken    from "../../assets/categories/chicken.png";
import coffee     from "../../assets/categories/coffee.png";
import dessert    from "../../assets/categories/dessert.png";
import dosa       from "../../assets/categories/dosa.png";
import egg        from "../../assets/categories/egg.png";
import fish       from "../../assets/categories/fish.png";
import fried      from "../../assets/categories/friedrice.png";
import greensalad from "../../assets/categories/greensalad.png";
import juice      from "../../assets/categories/juice.png";
import mealbox    from "../../assets/categories/mealbox.png";
import noodles    from "../../assets/categories/noodles.png";
import paneer     from "../../assets/categories/paneer.png";
import pasta      from "../../assets/categories/pasta.png";
import roti       from "../../assets/categories/roti.png";
import tiffin     from "../../assets/categories/tiffin.png";

const LOCAL_IMAGES = {
  "All":        all,
  "Pizza":      pizza,
  "Biryani":    biryani,
  "Burger":     burger,
  "Cake":       cake,
  "Chicken":    chicken,
  "Coffee":     coffee,
  "Dessert":    dessert,
  "Dosa":       dosa,
  "Egg":        egg,
  "Fish":       fish,
  "Fried Rice": fried,
  "Healthy":    greensalad,
  "Juice":      juice,
  "Meal Box":   mealbox,
  "Noodles":    noodles,
  "Paneer":     paneer,
  "Pasta":      pasta,
  "Roti":       roti,
  "Tiffin":     tiffin,
};

const getImage = (cat) => cat.image || LOCAL_IMAGES[cat.name] || null;

function CategorySection({
  activeCategory = "All",
  setActiveCategory = () => {},
  onSeeAll = null,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data } = await API.get("/customer/categories");
        if (data.success && data.data) {
          // Only active categories; prepend "All"
          const active = data.data.filter((c) => c.isActive !== false);
          setCategories([{ _id: "all", name: "All" }, ...active]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([{ _id: "all", name: "All" }]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (name) => {
    setActiveCategory(name);
    window.dispatchEvent(
      new CustomEvent("categoryChange", {
        detail: { category: name === "All" ? "" : name },
      })
    );
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-800">Explore Category</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 px-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center shrink-0" style={{ minWidth: "68px" }}>
              <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="w-12 h-2 bg-gray-200 rounded mt-2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-800">
          Explore Category
        </h2>
        <button
          onClick={() => onSeeAll ? onSeeAll() : handleCategoryClick("All")}
          className="text-xs sm:text-sm text-orange-500 font-semibold hover:underline"
        >
          See All
        </button>
      </div>

      {/* SCROLL CONTAINER */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-1 scrollbar-hide">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          const img = getImage(cat);

          return (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.name)}
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
                {img ? (
                  <img
                    src={img}
                    alt={cat.name}
                    className={`object-contain transition-all duration-300 ${
                      isActive ? "w-9 h-9 sm:w-10 sm:h-10" : "w-8 h-8 sm:w-10 sm:h-10"
                    }`}
                  />
                ) : (
                  <FaUtensils className="text-orange-400 text-2xl" />
                )}
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