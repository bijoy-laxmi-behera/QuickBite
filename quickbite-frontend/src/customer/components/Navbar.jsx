import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="bg-[#2b0a03] text-white p-4 flex justify-between items-center">

      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/customer/home")}
      >
        QuickBite
      </h1>

      <div className="flex items-center gap-4">

        <button onClick={() => navigate("/customer/orders")}>
          Orders
        </button>

        <button onClick={() => navigate("/customer/cart")}>
          Cart ({totalItems})
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="text-red-400"
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Navbar;