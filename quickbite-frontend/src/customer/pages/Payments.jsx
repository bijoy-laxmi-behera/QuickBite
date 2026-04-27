import { useState, useEffect } from "react";

function Payments() {
  const [cards, setCards] = useState([]);
  const [cardNumber, setCardNumber] = useState("");

  // 🔁 Load cards
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cards")) || [];
    setCards(saved);
  }, []);

  // 💾 Save cards
  useEffect(() => {
    localStorage.setItem("cards", JSON.stringify(cards));
  }, [cards]);

  const addCard = () => {
    const clean = cardNumber.replace(/\s/g, "");

    if (clean.length < 12) {
      alert("Enter valid card number ❗");
      return;
    }

    const newCard = {
      id: Date.now(),
      number: clean,
      isDefault: cards.length === 0, // first card auto default
    };

    setCards([...cards, newCard]);
    setCardNumber("");
  };

  const removeCard = (id) => {
    const updated = cards.filter((c) => c.id !== id);

    // ensure at least one default
    if (updated.length > 0 && !updated.some((c) => c.isDefault)) {
      updated[0].isDefault = true;
    }

    setCards(updated);
  };

  const setDefault = (id) => {
    setCards(
      cards.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Payment Methods</h2>

      {/* ADD CARD */}
      <div className="flex gap-2 mb-4">
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="Card Number"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={addCard}
          className="bg-orange-500 text-white px-3 rounded"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {cards.length === 0 ? (
        <p className="text-gray-500">No cards added</p>
      ) : (
        cards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-3 mb-2 rounded shadow flex justify-between"
          >
            <div>
              <p>**** **** **** {card.number.slice(-4)}</p>
              {card.isDefault && (
                <span className="text-green-500 text-sm">
                  Default
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {!card.isDefault && (
                <button onClick={() => setDefault(card.id)}>
                  Set Default
                </button>
              )}
              <button onClick={() => removeCard(card.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}

    </div>
  );
}

export default Payments;