import { useState } from "react";

function Checkout({ cart, setCart, setPage, setPayments }) {
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("cod");
  const [loading, setLoading] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: ""
  });

  // 💰 Total
  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  const handlePlaceOrder = () => {
    if (!address) {
      alert("Enter address ❗");
      return;
    }

    console.log("Placing order...");
    console.log("Payment:", payment);

    // ✅ SAVE CARD
    if (payment === "card") {
      if (!cardDetails.number) {
        alert("Enter card details ❗");
        return;
      }

      const savedCards =
        JSON.parse(localStorage.getItem("cards")) || [];

      const newCard = {
        id: Date.now(),
        number: cardDetails.number,
        expiry: cardDetails.expiry
      };

      const updatedCards = [...savedCards, newCard];

      localStorage.setItem("cards", JSON.stringify(updatedCards));

      // ✅ update state if available
      if (setPayments) {
        setPayments(updatedCards);
      }

      console.log("Card saved ✅");
    }

    setLoading(true);

    setTimeout(() => {
      setCart([]);
      setPage("success");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen max-w-2xl mx-auto">

      <h2 className="text-2xl font-bold mb-6">Checkout 🧾</h2>

      {/* ADDRESS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-2">Delivery Address</h3>

        <input
          type="text"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* PAYMENT */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-2">Payment Method</h3>

        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        >
          <option value="cod">Cash on Delivery</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
        </select>

        {payment === "card" && (
          <div className="space-y-2">
            <input
              placeholder="Card Number"
              value={cardDetails.number}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, number: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              placeholder="Expiry Date"
              value={cardDetails.expiry}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, expiry: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <input
              placeholder="CVV"
              value={cardDetails.cvv}
              onChange={(e) =>
                setCardDetails({ ...cardDetails, cvv: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-2">Order Summary</h3>

        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>{item.name} x {item.qty || 1}</span>
            <span>₹{(item.price || 0) * (item.qty || 1)}</span>
          </div>
        ))}

        <hr className="my-2" />

        <h3 className="font-bold text-lg">Total: ₹{total}</h3>
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className={`w-full py-3 rounded-lg text-white ${
          loading ? "bg-gray-400" : "bg-orange-500"
        }`}
      >
        {loading ? "Processing..." : "Pay & Place Order"}
      </button>

    </div>
  );
}

export default Checkout;