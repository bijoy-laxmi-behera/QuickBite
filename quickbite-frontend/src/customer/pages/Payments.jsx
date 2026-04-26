import { useState } from "react";

function Payments() {
  const [cards, setCards] = useState([]);
  const [cardNumber, setCardNumber] = useState("");

  const addCard = () => {
    if (!cardNumber) return;
    setCards([...cards, { id: Date.now(), number: cardNumber, isDefault: false }]);
    setCardNumber("");
  };

  const removeCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const setDefault = (id) => {
    setCards(cards.map(c => ({
      ...c,
      isDefault: c.id === id
    })));
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
        <button onClick={addCard} className="bg-orange-500 text-white px-3 rounded">
          Add
        </button>
      </div>

      {/* LIST */}
      {cards.map(card => (
        <div key={card.id} className="bg-white p-3 mb-2 rounded shadow flex justify-between">

          <div>
            <p>**** **** **** {card.number.slice(-4)}</p>
            {card.isDefault && <span className="text-green-500 text-sm">Default</span>}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setDefault(card.id)}>Set Default</button>
            <button onClick={() => removeCard(card.id)}>Delete</button>
          </div>

        </div>
      ))}

    </div>
  );
}

export default Payments;