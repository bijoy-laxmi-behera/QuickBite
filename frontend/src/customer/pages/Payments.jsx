// src/customer/pages/Payments.jsx
import { useState, useEffect, useRef } from "react";
import {
  FaCreditCard, FaPlus, FaTrash, FaStar, FaSpinner,
  FaCheckCircle, FaTimesCircle, FaMobile, FaMoneyBillWave,
  FaShieldAlt, FaUniversity, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { SiVisa, SiMastercard, SiRazorpay, SiGooglepay, SiPaytm } from "react-icons/si";
import { MdRefresh } from "react-icons/md";
import API from "../../services/axios";
import { getSocket } from "../../services/axios";

// ─── UPI Apps ────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "googlepay",  name: "Google Pay",  icon: "🟢", placeholder: "mobilenumber@okicici" },
  { id: "phonepe",    name: "PhonePe",     icon: "🟣", placeholder: "mobilenumber@ybl" },
  { id: "paytm",      name: "Paytm",       icon: "🔵", placeholder: "mobilenumber@paytm" },
  { id: "bhim",       name: "BHIM UPI",    icon: "🏦", placeholder: "vpa@upi" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const maskCard = (num) => `•••• •••• •••• ${String(num).slice(-4)}`;
const last4    = (num)  => String(num).slice(-4);
const getBrand = (num)  => {
  const n = String(num).replace(/\D/g, "");
  if (n.startsWith("4")) return "visa";
  if (n.startsWith("5")) return "mastercard";
  if (n.startsWith("3")) return "amex";
  return "other";
};
const BrandIcon = ({ brand, className = "text-xl" }) => {
  if (brand === "visa")       return <SiVisa       className={`text-blue-700 ${className}`} />;
  if (brand === "mastercard") return <SiMastercard className={`text-red-500 ${className}`} />;
  return <FaCreditCard className={`text-gray-400 ${className}`} />;
};

// ─── UPI Verification Status Indicator ───────────────────────────────────────
function UpiVerifyBadge({ status }) {
  if (status === "verifying") return (
    <span className="flex items-center gap-1 text-xs text-blue-500">
      <FaSpinner className="animate-spin text-[10px]" /> Verifying...
    </span>
  );
  if (status === "valid") return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
      <FaCheckCircle className="text-[12px]" /> Verified
    </span>
  );
  if (status === "invalid") return (
    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
      <FaTimesCircle className="text-[12px]" /> Invalid VPA
    </span>
  );
  return null;
}

// ─── Real-time UPI Payment Modal ──────────────────────────────────────────────
function UpiPaymentModal({ amount, orderId, onSuccess, onClose }) {
  const [upiId,       setUpiId]       = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [phase,       setPhase]       = useState("input"); // input | sent | polling | success | failed
  const [countdown,   setCountdown]   = useState(300);     // 5 min timeout
  const [verifyStatus,setVerifyStatus]= useState(null);
  const [verifyTimer, setVerifyTimer] = useState(null);
  const socketRef = useRef(null);
  const pollRef   = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(verifyTimer);
      clearInterval(pollRef.current);
    };
  }, [verifyTimer]);

  // Verify UPI VPA on blur / after 1s debounce
  const handleUpiChange = (val) => {
    setUpiId(val);
    setVerifyStatus(null);
    clearTimeout(verifyTimer);
    if (!val.includes("@")) return;
    const t = setTimeout(() => verifyVpa(val), 900);
    setVerifyTimer(t);
  };

  const verifyVpa = async (vpa) => {
    setVerifyStatus("verifying");
    try {
      const res = await API.post("/customer/payments/verify-upi", { vpa });
      setVerifyStatus(res.data.success && res.data.data?.valid ? "valid" : "invalid");
    } catch {
      setVerifyStatus("invalid");
    }
  };

  const initiatePayment = async () => {
    if (!upiId || verifyStatus === "invalid") return;
    setPhase("sent");

    try {
      await API.post("/customer/payments/initiate-upi", {
        orderId,
        upiId,
        amount,
      });
    } catch (err) {
      setPhase("failed");
      return;
    }

    setPhase("polling");

    // Socket listener for instant confirmation
    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      socket.on("paymentConfirmed", (data) => {
        if (data.orderId === orderId) {
          clearInterval(pollRef.current);
          setPhase("success");
          setTimeout(() => onSuccess(data), 1500);
        }
      });
      socket.on("paymentFailed", (data) => {
        if (data.orderId === orderId) {
          clearInterval(pollRef.current);
          setPhase("failed");
        }
      });
    }

    // Countdown + polling fallback
    let remaining = 300;
    pollRef.current = setInterval(async () => {
      remaining -= 5;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(pollRef.current);
        setPhase("failed");
        return;
      }
      try {
        const res = await API.get(`/customer/payments/status/${orderId}`);
        if (res.data.data?.status === "paid") {
          clearInterval(pollRef.current);
          setPhase("success");
          setTimeout(() => onSuccess(res.data.data), 1500);
        }
      } catch {}
    }, 5000);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-medium">Paying</p>
            <p className="text-white text-2xl font-black">₹{amount}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5">
          {/* INPUT PHASE */}
          {phase === "input" && (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-3">Choose UPI App</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {UPI_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setUpiId("");
                      setVerifyStatus(null);
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${selectedApp?.id === app.id ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-gray-200"}`}
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <span className="text-[10px] text-gray-500 font-medium">{app.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mb-3">— or enter UPI ID —</p>

              <div className="relative mb-1">
                <input
                  value={upiId}
                  onChange={e => handleUpiChange(e.target.value)}
                  placeholder={selectedApp?.placeholder || "yourname@upi"}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 transition pr-24"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <UpiVerifyBadge status={verifyStatus} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">Enter your UPI ID (VPA)</p>

              <button
                onClick={initiatePayment}
                disabled={!upiId || verifyStatus === "invalid" || verifyStatus === "verifying"}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-3.5 rounded-2xl font-extrabold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <FaMobile /> Pay ₹{amount}
              </button>
            </>
          )}

          {/* SENT / POLLING */}
          {(phase === "sent" || phase === "polling") && (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="w-full h-full rounded-full border-4 border-orange-200" />
                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">📱</div>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Payment Request Sent!</h3>
              <p className="text-sm text-gray-500 mb-3">
                Open your UPI app and approve the payment request
              </p>
              <div className="bg-orange-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-orange-600 font-medium">Waiting for payment...</p>
                <p className="text-lg font-black text-orange-500 mt-1">{fmt(countdown)}</p>
              </div>
              <p className="text-xs text-gray-400">This page will auto-update when payment is confirmed</p>
            </div>
          )}

          {/* SUCCESS */}
          {phase === "success" && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h3 className="font-bold text-green-700 text-xl mb-1">Payment Successful! 🎉</h3>
              <p className="text-sm text-gray-500">Your order has been confirmed.</p>
            </div>
          )}

          {/* FAILED */}
          {phase === "failed" && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="text-red-400 text-4xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Payment Failed</h3>
              <p className="text-sm text-gray-500 mb-4">Request timed out or was declined.</p>
              <button onClick={() => setPhase("input")} className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition">
                Try Again
              </button>
            </div>
          )}

          {(phase === "sent" || phase === "polling") && (
            <button onClick={() => { clearInterval(pollRef.current); setPhase("input"); }} className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card Form ────────────────────────────────────────────────────────────────
function CardForm({ onSave, onCancel, saving }) {
  const [form, setForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [flipped, setFlipped] = useState(false);

  const handleExpiryChange = (val) => {
    let v = val.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    setForm(f => ({ ...f, expiry: v }));
  };

  const brand = getBrand(form.number);

  return (
    <div className="bg-white rounded-2xl border border-orange-100 p-4 mb-4 shadow-sm">
      <h3 className="font-bold text-sm text-gray-700 mb-4">Add New Card</h3>

      {/* Mini card preview */}
      <div className="mb-4 relative">
        <div className={`bg-gradient-to-br ${brand === "visa" ? "from-blue-700 to-blue-900" : brand === "mastercard" ? "from-red-600 to-orange-700" : "from-gray-700 to-gray-900"} rounded-2xl p-4 text-white h-28 flex flex-col justify-between shadow-lg`}>
          <div className="flex justify-between items-start">
            <div className="w-8 h-6 bg-yellow-400/80 rounded-sm" />
            <BrandIcon brand={brand} className="text-2xl text-white opacity-90" />
          </div>
          <div>
            <p className="font-mono text-sm tracking-widest opacity-90">
              {form.number ? maskCard(form.number.padEnd(16, "•")) : "•••• •••• •••• ••••"}
            </p>
            <div className="flex justify-between mt-1">
              <p className="text-xs opacity-70">{form.name || "CARDHOLDER NAME"}</p>
              <p className="text-xs opacity-70">{form.expiry || "MM/YY"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <input
          placeholder="Cardholder Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
          className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition"
        />
        <input
          placeholder="Card Number"
          maxLength={16}
          value={form.number}
          onChange={e => setForm(f => ({ ...f, number: e.target.value.replace(/\D/g, "") }))}
          className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition font-mono"
        />
        <div className="flex gap-2">
          <input
            placeholder="MM/YY"
            value={form.expiry}
            onChange={e => handleExpiryChange(e.target.value)}
            className="flex-1 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition"
          />
          <input
            placeholder="CVV"
            maxLength={4}
            type="password"
            value={form.cvv}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
            onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "") }))}
            className="flex-1 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-orange-400 transition"
          />
        </div>
      </div>

      <p className="flex items-center gap-1 text-xs text-gray-400 mt-2 mb-3">
        <FaShieldAlt className="text-green-400" /> Your card info is encrypted & secure
      </p>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={saving || form.number.length < 12 || !form.name || !form.expiry}
          className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? <FaSpinner className="animate-spin" /> : null}
          {saving ? "Saving..." : "Save Card"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Payments({ onPaymentComplete, pendingOrderId, pendingAmount, mode = "manage" }) {
  const [cards,           setCards]           = useState([]);
  const [upiIds,          setUpiIds]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [addingCard,      setAddingCard]      = useState(false);
  const [addingUpi,       setAddingUpi]       = useState(false);
  const [savingCard,      setSavingCard]      = useState(false);
  const [savingUpi,       setSavingUpi]       = useState(false);
  const [newUpiId,        setNewUpiId]        = useState("");
  const [upiVerifyStatus, setUpiVerifyStatus] = useState(null);
  const [verifyTimer,     setVerifyTimer]     = useState(null);
  const [showUpiPayment,  setShowUpiPayment]  = useState(false);
  const [expandedSection, setExpandedSection] = useState("cards");

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await API.get("/customer/me/payment-methods");
      if (res.data.success) {
        const all = res.data.data || [];
        setCards(all.filter(m => m.type === "card").map(c => ({
          id: c._id, _id: c._id,
          number: c.cardNumber || `****${c.last4}`,
          last4: c.last4,
          name: c.cardholderName,
          expiry: c.expiry,
          isDefault: c.isDefault,
          brand: c.brand,
        })));
        setUpiIds(all.filter(m => m.type === "upi").map(u => ({
          id: u._id, _id: u._id,
          upiId: u.upiId,
          isDefault: u.isDefault,
        })));
      }
    } catch (err) {
      console.error("fetchPayments:", err);
      // Load from localStorage backup
      try { setCards(JSON.parse(localStorage.getItem("savedCards") || "[]")); } catch {}
      try { setUpiIds(JSON.parse(localStorage.getItem("savedUpiIds") || "[]")); } catch {}
    } finally {
      setLoading(false);
    }
  };

  // ── Save card ─────────────────────────────────────────────────────────────────
  const handleSaveCard = async (form) => {
    setSavingCard(true);
    try {
      const payload = {
        type: "card",
        cardNumber: form.number,
        last4: last4(form.number),
        cardholderName: form.name,
        expiry: form.expiry,
        brand: getBrand(form.number),
        isDefault: cards.length === 0,
      };
      const res = await API.post("/customer/me/payment-methods", payload);
      const newCard = {
        id: res.data?.data?._id || Date.now(),
        _id: res.data?.data?._id || Date.now(),
        ...payload,
        number: form.number,
      };
      const updated = [...cards, newCard];
      setCards(updated);
      localStorage.setItem("savedCards", JSON.stringify(updated));
      setAddingCard(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save card");
    } finally {
      setSavingCard(false);
    }
  };

  // ── Remove card ───────────────────────────────────────────────────────────────
  const removeCard = async (id) => {
    if (!window.confirm("Remove this card?")) return;
    try {
      await API.delete(`/customer/me/payment-methods/${id}`);
      const updated = cards.filter(c => c.id !== id && c._id !== id);
      setCards(updated);
      localStorage.setItem("savedCards", JSON.stringify(updated));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove card");
    }
  };

  const setDefaultCard = async (id) => {
    try {
      await API.patch(`/customer/me/payment-methods/${id}/default`);
      setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id || c._id === id })));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update default");
    }
  };

  // ── UPI management ────────────────────────────────────────────────────────────
  const handleUpiChange = (val) => {
    setNewUpiId(val);
    setUpiVerifyStatus(null);
    clearTimeout(verifyTimer);
    if (!val.includes("@")) return;
    const t = setTimeout(async () => {
      setUpiVerifyStatus("verifying");
      try {
        const res = await API.post("/customer/payments/verify-upi", { vpa: val });
        setUpiVerifyStatus(res.data.success && res.data.data?.valid ? "valid" : "invalid");
      } catch { setUpiVerifyStatus("invalid"); }
    }, 900);
    setVerifyTimer(t);
  };

  const saveUpiId = async () => {
    if (!newUpiId || upiVerifyStatus === "invalid") return;
    setSavingUpi(true);
    try {
      const res = await API.post("/customer/me/payment-methods", {
        type: "upi",
        upiId: newUpiId,
        isDefault: upiIds.length === 0,
      });
      const newEntry = {
        id: res.data?.data?._id || Date.now(),
        _id: res.data?.data?._id || Date.now(),
        upiId: newUpiId,
        isDefault: upiIds.length === 0,
      };
      const updated = [...upiIds, newEntry];
      setUpiIds(updated);
      localStorage.setItem("savedUpiIds", JSON.stringify(updated));
      setNewUpiId("");
      setUpiVerifyStatus(null);
      setAddingUpi(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save UPI ID");
    } finally {
      setSavingUpi(false);
    }
  };

  const removeUpi = async (id) => {
    if (!window.confirm("Remove this UPI ID?")) return;
    try {
      await API.delete(`/customer/me/payment-methods/${id}`);
      const updated = upiIds.filter(u => u.id !== id && u._id !== id);
      setUpiIds(updated);
      localStorage.setItem("savedUpiIds", JSON.stringify(updated));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove UPI ID");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-500 text-3xl mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      {/* UPI Payment modal */}
      {showUpiPayment && pendingOrderId && (
        <UpiPaymentModal
          amount={pendingAmount}
          orderId={pendingOrderId}
          onSuccess={(data) => { setShowUpiPayment(false); onPaymentComplete?.(data); }}
          onClose={() => setShowUpiPayment(false)}
        />
      )}

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FaCreditCard className="text-orange-500" />
            <h2 className="text-xl font-extrabold text-gray-800">Payment Methods</h2>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {cards.length + upiIds.length}
            </span>
          </div>
          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
          >
            <MdRefresh className="text-base" />
          </button>
        </div>

        {/* UPI Pay button (when in payment mode) */}
        {mode === "payment" && pendingAmount && (
          <button
            onClick={() => setShowUpiPayment(true)}
            className="w-full mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-2xl font-extrabold shadow-lg flex items-center justify-center gap-2 hover:from-blue-600 transition"
          >
            <FaMobile className="text-xl" /> Pay ₹{pendingAmount} via UPI
          </button>
        )}

        {/* ── CARDS SECTION ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <button
            onClick={() => setExpandedSection(s => s === "cards" ? null : "cards")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-orange-400" />
              <span className="font-bold text-gray-800">Debit / Credit Cards</span>
              <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-semibold">{cards.length}</span>
            </div>
            {expandedSection === "cards" ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
          </button>

          {expandedSection === "cards" && (
            <div className="px-4 pb-4">
              {/* Add card button */}
              {!addingCard && (
                <button
                  onClick={() => setAddingCard(true)}
                  className="w-full mb-3 border-2 border-dashed border-orange-200 text-orange-400 py-3 rounded-2xl text-sm font-semibold hover:border-orange-400 hover:bg-orange-50 transition flex items-center justify-center gap-2"
                >
                  <FaPlus className="text-xs" /> Add Card
                </button>
              )}

              {addingCard && (
                <CardForm
                  onSave={handleSaveCard}
                  onCancel={() => setAddingCard(false)}
                  saving={savingCard}
                />
              )}

              {cards.length === 0 && !addingCard && (
                <div className="text-center py-6">
                  <FaCreditCard className="text-4xl text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No saved cards yet</p>
                </div>
              )}

              <div className="space-y-3">
                {cards.map((card) => {
                  const brand = card.brand || getBrand(card.number);
                  return (
                    <div
                      key={card.id || card._id}
                      className={`rounded-2xl border overflow-hidden relative ${card.isDefault ? "border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50" : "border-gray-100 bg-white"}`}
                    >
                      <div className={`h-1 w-full ${brand === "visa" ? "bg-blue-600" : brand === "mastercard" ? "bg-red-500" : "bg-gray-400"}`} />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <BrandIcon brand={brand} className="text-2xl" />
                          {card.isDefault && (
                            <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <FaStar className="text-[8px]" /> Default
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-sm font-bold text-gray-700 tracking-widest mb-1">
                          {maskCard(card.number || `0000${card.last4}`)}
                        </p>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{card.name || "Cardholder"}</span>
                          <span>{card.expiry}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {!card.isDefault && (
                            <button onClick={() => setDefaultCard(card.id || card._id)} className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-100 transition font-semibold">
                              Set Default
                            </button>
                          )}
                          <button onClick={() => removeCard(card.id || card._id)} className="flex items-center gap-1 text-xs text-red-400 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full hover:bg-red-100 transition font-semibold ml-auto">
                            <FaTrash className="text-[10px]" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── UPI SECTION ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <button
            onClick={() => setExpandedSection(s => s === "upi" ? null : "upi")}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-2">
              <FaMobile className="text-blue-400" />
              <span className="font-bold text-gray-800">UPI / BHIM</span>
              <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full font-semibold">{upiIds.length}</span>
            </div>
            {expandedSection === "upi" ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
          </button>

          {expandedSection === "upi" && (
            <div className="px-4 pb-4">
              {!addingUpi && (
                <button
                  onClick={() => setAddingUpi(true)}
                  className="w-full mb-3 border-2 border-dashed border-blue-200 text-blue-400 py-3 rounded-2xl text-sm font-semibold hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  <FaPlus className="text-xs" /> Add UPI ID
                </button>
              )}

              {addingUpi && (
                <div className="bg-blue-50 rounded-2xl p-4 mb-3 border border-blue-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Enter UPI ID</p>
                  <div className="relative mb-1">
                    <input
                      value={newUpiId}
                      onChange={e => handleUpiChange(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-400 transition pr-28"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <UpiVerifyBadge status={upiVerifyStatus} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">e.g. 9999999999@ybl or name@okhdfcbank</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setAddingUpi(false); setNewUpiId(""); setUpiVerifyStatus(null); }} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm font-semibold">
                      Cancel
                    </button>
                    <button
                      onClick={saveUpiId}
                      disabled={savingUpi || !newUpiId || upiVerifyStatus === "invalid" || upiVerifyStatus === "verifying"}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {savingUpi ? <FaSpinner className="animate-spin" /> : null}
                      {savingUpi ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {upiIds.length === 0 && !addingUpi && (
                <div className="text-center py-6">
                  <FaMobile className="text-4xl text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No saved UPI IDs</p>
                </div>
              )}

              <div className="space-y-2">
                {upiIds.map((upi) => (
                  <div key={upi.id || upi._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📱</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{upi.upiId}</p>
                      <p className="text-xs text-gray-400">Linked UPI ID</p>
                    </div>
                    {upi.isDefault
                      ? <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold shrink-0">Default</span>
                      : <button onClick={() => removeUpi(upi.id || upi._id)} className="text-red-400 hover:text-red-600 transition shrink-0"><FaTrash className="text-xs" /></button>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── COD Info ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <FaMoneyBillWave className="text-green-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-700">Cash on Delivery</p>
              <p className="text-xs text-gray-400">Always available · Pay when order arrives</p>
            </div>
            <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">Available</span>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400">
          <FaShieldAlt className="text-green-400" />
          <span>256-bit SSL encrypted · PCI DSS compliant</span>
        </div>
      </div>
    </div>
  );
}

export default Payments;
