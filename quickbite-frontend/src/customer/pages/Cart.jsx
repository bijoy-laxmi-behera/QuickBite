import { useState } from "react";

function Cart({ cart, setCart, setPage }) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  // ➕ Increase
  const increase = (item) => {
    setCart(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, qty: i.qty + 1 } : i
      )
    );
  };

  // ➖ Decrease
  const decrease = (item) => {
    setCart(prev =>
      prev
        .map(i =>
          i.id === item.id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter(i => i.qty > 0)
    );
  };

  // ❌ Remove item
  const removeItem = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // 🧹 Clear cart
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCoupon("");
  };

  // 🎟 Apply coupon
  const applyCoupon = () => {
    if (coupon === "SAVE10") {
      setDiscount(0.1); // 10%
      alert("Coupon applied 🎉");
    } else {
      setDiscount(0);
      alert("Invalid coupon ❌");
    }
  };

  // 💰 Totals
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = total * discount;
  const finalTotal = total - discountAmount;

  return (
    <div className="p-4 max-w-2xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.map(item => (
            <div
              key={item.id}
              className="bg-white p-4 mb-3 rounded shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p>₹{item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => decrease(item)} className="px-2">-</button>
                <span>{item.qty}</span>
                <button onClick={() => increase(item)} className="px-2">+</button>
              </div>

              <button onClick={() => removeItem(item.id)}>❌</button>
            </div>
          ))}

          {/* COUPON */}
          <div className="flex gap-2 mt-4">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter coupon"
              className="border p-2 flex-1 rounded"
            />
            <button
              onClick={applyCoupon}
              className="bg-orange-500 text-white px-3 rounded"
            >
              Apply
            </button>
          </div>

          {/* TOTAL */}
          <div className="mt-4 bg-white p-4 rounded shadow">
            <p>Total: ₹{total}</p>
            <p>Discount: ₹{discountAmount.toFixed(2)}</p>
            <h3 className="font-bold text-lg">
              Final: ₹{finalTotal.toFixed(2)}
            </h3>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-4">

            <button
              onClick={clearCart}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Clear Cart
            </button>

            <button
              onClick={() => {
                console.log("GOING TO CHECKOUT"); // ✅ DEBUG
                if (cart.length === 0) {
                  alert("Cart is empty ❗");
                  return;
                }
                setPage("checkout");
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Checkout
            </button>

          </div>
        </>
      )}
    </div>
  );
}

export default Cart;