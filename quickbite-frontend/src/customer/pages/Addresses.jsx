import { useState } from "react";

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [input, setInput] = useState("");

  const addAddress = () => {
    if (!input) return;
    setAddresses([...addresses, input]);
    setInput("");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="font-bold text-lg mb-3">My Addresses</h2>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter address"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={addAddress}
          className="bg-orange-500 text-white px-3 rounded"
        >
          Add
        </button>
      </div>

      {addresses.map((addr, i) => (
        <div key={i} className="bg-white p-3 rounded shadow mb-2">
          {addr}
        </div>
      ))}
    </div>
  );
}

export default Addresses;