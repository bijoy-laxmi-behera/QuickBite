import { useState } from "react";
import { FaCreditCard, FaPlus, FaTrash, FaStar } from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";

function Payments() {
  const [cards, setCards] = useState([
    { id: 1, number: "4532123456781234", name: "Arjun Mehta", expiry: "12/27", isDefault: true },
  ]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const addCard = () => {
    if (!form.number || form.number.length < 12) return;
    setCards([...cards, { id: Date.now(), ...form, isDefault: false }]);
    setForm({ number: "", name: "", expiry: "", cvv: "" });
    setAdding(false);
  };

  const removeCard = (id) => setCards((prev) => prev.filter((c) => c.id !== id));
  const setDefault = (id) => setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));

  const getCardBrand = (num) => {
    if (num.startsWith("4")) return <SiVisa className="text-blue-600 text-xl" />;
    if (num.startsWith("5")) return <SiMastercard className="text-red-500 text-xl" />;
    return <FaCreditCard className="text-gray-400 text-xl" />;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaCreditCard className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">Payment Methods</h2>
          </div>
          <button onClick={() => setAdding(!adding)}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition">
            <FaPlus className="text-[10px]" /> Add Card
          </button>
        </div>

        {/* ADD FORM */}
        {adding && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 mb-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Add New Card</h3>
            <div className="space-y-2">
              <input placeholder="Cardholder Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <input placeholder="Card Number" maxLength={16} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <div className="flex gap-2">
                <input placeholder="MM/YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
                <input placeholder="CVV" maxLength={3} value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              </div>
            </div>
            <button onClick={addCard}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition">
              Save Card
            </button>
          </div>
        )}

        {/* CARDS */}
        <div className="space-y-3">
          {cards.map((card) => (
            <div key={card.id} className={`rounded-2xl p-4 shadow-sm border overflow-hidden relative ${card.isDefault ? "border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" : "border-gray-100 bg-white"}`}>
              {/* BG DECORATION */}
              <div className="absolute right-4 top-4 opacity-5 text-8xl font-black text-orange-500">₹</div>

              <div className="flex items-center justify-between mb-3">
                {getCardBrand(card.number)}
                {card.isDefault && (
                  <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <FaStar className="text-[8px]" /> Default
                  </span>
                )}
              </div>

              <p className="font-mono text-base font-bold text-gray-700 tracking-widest mb-1">
                •••• •••• •••• {card.number.slice(-4)}
              </p>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{card.name || "Cardholder"}</span>
                <span>Exp: {card.expiry}</span>
              </div>

              <div className="flex gap-2 mt-3">
                {!card.isDefault && (
                  <button onClick={() => setDefault(card.id)}
                    className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition font-semibold">
                    Set Default
                  </button>
                )}
                <button onClick={() => removeCard(card.id)}
                  className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold ml-auto">
                  <FaTrash className="text-[10px]" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* UPI SECTION */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">UPI IDs</h3>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">📱</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">arjun@upi</p>
              <p className="text-xs text-gray-400">Linked UPI ID</p>
            </div>
            <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;