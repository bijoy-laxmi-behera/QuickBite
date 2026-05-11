import { useState, useEffect } from "react";
import { FaCreditCard, FaPlus, FaTrash, FaStar, FaSpinner } from "react-icons/fa";
import { SiVisa, SiMastercard } from "react-icons/si";
import API from "../../services/axios"; // ADDED: Import axios config

function Payments() {
  const [cards, setCards] = useState([]);
  const [upiIds, setUpiIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ number: "", name: "", expiry: "", cvv: "" });

  // ADDED: Fetch payment methods from backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await API.get("/customer/me/payment-methods");
        
        if (response.data.success) {
          const methods = response.data.data || [];
          
          // Separate cards and UPI IDs
          const savedCards = methods.filter(m => m.type === "card").map(card => ({
            id: card._id,
            _id: card._id,
            number: card.cardNumber,
            last4: card.last4,
            name: card.cardholderName,
            expiry: card.expiry,
            isDefault: card.isDefault,
            brand: card.brand
          }));
          
          const savedUpiIds = methods.filter(m => m.type === "upi").map(upi => ({
            id: upi._id,
            _id: upi._id,
            upiId: upi.upiId,
            isDefault: upi.isDefault
          }));
          
          setCards(savedCards);
          setUpiIds(savedUpiIds);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        // Fallback to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const savedCards = localStorage.getItem("savedCards");
      if (savedCards) {
        try {
          setCards(JSON.parse(savedCards));
        } catch (e) {}
      }
      const savedUpi = localStorage.getItem("savedUpiIds");
      if (savedUpi) {
        try {
          setUpiIds(JSON.parse(savedUpi));
        } catch (e) {}
      }
    };

    fetchPaymentMethods();
  }, []);

  // ADDED: Save payment methods to localStorage backup
  const saveToLocalStorage = (updatedCards, updatedUpiIds) => {
    localStorage.setItem("savedCards", JSON.stringify(updatedCards));
    localStorage.setItem("savedUpiIds", JSON.stringify(updatedUpiIds));
  };

  // ADDED: Get card brand from number
  const getCardBrandFromNumber = (number) => {
    if (number.startsWith("4")) return "visa";
    if (number.startsWith("5")) return "mastercard";
    if (number.startsWith("3")) return "amex";
    return "other";
  };

  // ADDED: Format card number for display (masked)
  const maskCardNumber = (number) => {
    const last4 = number.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  // ADDED: Get last 4 digits
  const getLast4 = (number) => number.slice(-4);

  // ADDED: Add card to backend
  const addCard = async () => {
    if (!form.number || form.number.length < 12) {
      alert("Please enter a valid card number");
      return;
    }
    if (!form.name) {
      alert("Please enter cardholder name");
      return;
    }
    if (!form.expiry) {
      alert("Please enter expiry date");
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");
    
    try {
      const cardData = {
        type: "card",
        cardNumber: form.number,
        last4: getLast4(form.number),
        cardholderName: form.name,
        expiry: form.expiry,
        brand: getCardBrandFromNumber(form.number),
        isDefault: cards.length === 0 // First card becomes default
      };

      let response;
      if (token) {
        response = await API.post("/customer/me/payment-methods", cardData);
      }

      const newCard = {
        id: response?.data?.data?._id || Date.now(),
        _id: response?.data?.data?._id || Date.now(),
        number: form.number,
        last4: getLast4(form.number),
        name: form.name,
        expiry: form.expiry,
        isDefault: cards.length === 0,
        brand: getCardBrandFromNumber(form.number)
      };

      const updatedCards = [...cards, newCard];
      setCards(updatedCards);
      saveToLocalStorage(updatedCards, upiIds);
      
      setForm({ number: "", name: "", expiry: "", cvv: "" });
      setAdding(false);
      alert("Card added successfully!");
    } catch (error) {
      console.error("Error adding card:", error);
      alert(error.response?.data?.message || "Failed to add card");
    } finally {
      setSaving(false);
    }
  };

  // ADDED: Remove card from backend
  const removeCard = async (id) => {
    if (!window.confirm("Are you sure you want to remove this card?")) return;
    
    const token = localStorage.getItem("token");
    
    try {
      if (token) {
        await API.delete(`/customer/me/payment-methods/${id}`);
      }
      
      const updatedCards = cards.filter((c) => c.id !== id && c._id !== id);
      
      // If we removed the default card and there are other cards, set first as default
      const removedCard = cards.find(c => c.id === id || c._id === id);
      if (removedCard?.isDefault && updatedCards.length > 0 && token) {
        await API.patch(`/customer/me/payment-methods/${updatedCards[0]._id}/default`);
        updatedCards[0].isDefault = true;
      }
      
      setCards(updatedCards);
      saveToLocalStorage(updatedCards, upiIds);
      alert("Card removed successfully");
    } catch (error) {
      console.error("Error removing card:", error);
      alert(error.response?.data?.message || "Failed to remove card");
    }
  };

  // ADDED: Set default card
  const setDefault = async (id) => {
    const token = localStorage.getItem("token");
    
    try {
      if (token) {
        await API.patch(`/customer/me/payment-methods/${id}/default`);
      }
      
      const updatedCards = cards.map((c) => ({
        ...c,
        isDefault: (c.id === id || c._id === id)
      }));
      
      setCards(updatedCards);
      saveToLocalStorage(updatedCards, upiIds);
      alert("Default payment method updated");
    } catch (error) {
      console.error("Error setting default:", error);
      alert(error.response?.data?.message || "Failed to update default");
    }
  };

  // ADDED: Get card brand icon
  const getCardBrand = (card) => {
    const brand = card.brand || getCardBrandFromNumber(card.number);
    if (brand === "visa") return <SiVisa className="text-blue-600 text-xl" />;
    if (brand === "mastercard") return <SiMastercard className="text-red-500 text-xl" />;
    return <FaCreditCard className="text-gray-400 text-xl" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-md mx-auto px-4 pt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-orange-500" />
              <h2 className="text-xl font-extrabold text-gray-800">Payment Methods</h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-orange-500 text-2xl" />
            <span className="ml-2 text-gray-500">Loading payment methods...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-md mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaCreditCard className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">Payment Methods</h2>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {cards.length + upiIds.length}
            </span>
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
              <input 
                placeholder="Cardholder Name" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <input 
                placeholder="Card Number" 
                maxLength={16} 
                value={form.number} 
                onChange={(e) => setForm({ ...form, number: e.target.value.replace(/\D/g, '') })}
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              <div className="flex gap-2">
                <input 
                  placeholder="MM/YY" 
                  value={form.expiry} 
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
                <input 
                  placeholder="CVV" 
                  maxLength={3} 
                  type="password"
                  value={form.cvv} 
                  onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '') })}
                  className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-orange-400 transition" />
              </div>
            </div>
            <button 
              onClick={addCard}
              disabled={saving}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <FaSpinner className="animate-spin" /> : null}
              {saving ? "Saving..." : "Save Card"}
            </button>
          </div>
        )}

        {/* CARDS SECTION */}
        {cards.length > 0 && (
          <div className="space-y-3 mb-4">
            {cards.map((card) => (
              <div key={card.id || card._id} className={`rounded-2xl p-4 shadow-sm border overflow-hidden relative ${card.isDefault ? "border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50" : "border-gray-100 bg-white"}`}>
                {/* BG DECORATION */}
                <div className="absolute right-4 top-4 opacity-5 text-8xl font-black text-orange-500">₹</div>

                <div className="flex items-center justify-between mb-3">
                  {getCardBrand(card)}
                  {card.isDefault && (
                    <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <FaStar className="text-[8px]" /> Default
                    </span>
                  )}
                </div>

                <p className="font-mono text-base font-bold text-gray-700 tracking-widest mb-1">
                  {maskCardNumber(card.number || `****${card.last4}`)}
                </p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{card.name || "Cardholder"}</span>
                  <span>Exp: {card.expiry}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  {!card.isDefault && (
                    <button onClick={() => setDefault(card.id || card._id)}
                      className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition font-semibold">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => removeCard(card.id || card._id)}
                    className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold ml-auto">
                    <FaTrash className="text-[10px]" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY CARDS STATE */}
        {cards.length === 0 && !adding && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center mb-4">
            <FaCreditCard className="text-4xl text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No saved cards</p>
            <button 
              onClick={() => setAdding(true)}
              className="mt-2 text-orange-500 text-xs font-semibold hover:underline"
            >
              + Add your first card
            </button>
          </div>
        )}

        {/* UPI SECTION */}
        {upiIds.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3">UPI IDs</h3>
            {upiIds.map((upi) => (
              <div key={upi.id || upi._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{upi.upiId}</p>
                  <p className="text-xs text-gray-400">Linked UPI ID</p>
                </div>
                <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">
                  {upi.isDefault ? "Default" : "Active"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* DEFAULT UPI INFO */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">UPI IDs</h3>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">📱</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">yourname@upi</p>
              <p className="text-xs text-gray-400">Add UPI ID for faster checkout</p>
            </div>
            <button className="ml-auto text-xs text-orange-500 font-semibold hover:underline">
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;