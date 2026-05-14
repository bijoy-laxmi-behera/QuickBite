// ────────────────────────────────────────────────────────────
// Wallet.jsx
// ────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import axios from "axios";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns]     = useState([]);
  const [wds, setWds]       = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ amount: "", method: "upi", upiId: "" });
  const [busy, setBusy]     = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/delivery/wallet`, { headers: h }),
      axios.get(`${API}/delivery/wallet/transactions`, { headers: h }),
      axios.get(`${API}/delivery/wallet/withdrawals`, { headers: h }),
    ])
      .then(([w, t, d]) => {
        setWallet(w.data?.data || w.data);
        setTxns(Array.isArray(t.data?.data ?? t.data) ? (t.data?.data ?? t.data) : []);
        setWds(Array.isArray(d.data?.data ?? d.data) ? (d.data?.data ?? d.data) : []);
      }).catch(() => {}).finally(() => {});
  }, [token]);

  const handleWithdraw = async () => {
    setBusy(true);
    try {
      await axios.post(`${API}/delivery/wallet/withdraw`, form, { headers: { Authorization: `Bearer ${token}` } });
      setModal(false);
      const { data } = await axios.get(`${API}/delivery/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      setWallet(data?.data || data);
    } catch (e) { alert(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const wdIcon = { pending: <Clock size={12} className="text-amber-400" />, completed: <CheckCircle size={12} className="text-emerald-400" />, failed: <XCircle size={12} className="text-red-400" />, processing: <Clock size={12} className="text-blue-400" /> };

  return (
    <div className="space-y-6">
      {/* Balance + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-gradient-to-br from-orange-600/20 to-amber-600/5 border border-orange-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <WalletIcon size={16} className="text-orange-400" />
            <span className="text-xs text-orange-300/70 font-bold uppercase tracking-widest">Available Balance</span>
          </div>
          <p className="text-4xl font-black text-white">₹<span className="text-orange-400">{(wallet?.balance || 0).toLocaleString("en-IN")}</span></p>
          {wallet?.pendingBalance > 0 && <p className="text-xs text-zinc-500">+ ₹{wallet.pendingBalance} pending</p>}
          <button onClick={() => setModal(true)} disabled={!wallet?.balance || wallet.balance < 50}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-40">
            <ArrowDownToLine size={15} /> Withdraw
          </button>
        </div>

        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          {[
            { label: "Total Earned",    val: wallet?.totalEarned    || 0, color: "text-emerald-400" },
            { label: "Total Withdrawn", val: wallet?.totalWithdrawn || 0, color: "text-red-400"     },
            { label: "Tips Earned",     val: wallet?.totalTips      || 0, color: "text-yellow-400"  },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-[#0D0D14] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">{label}</p>
              <p className={`text-xl font-black ${color}`}>₹{val.toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions + Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h3 className="text-sm font-bold text-white">Transactions</h3></div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {txns.length === 0 ? <p className="text-zinc-600 text-sm text-center py-8">No transactions</p>
            : txns.map(tx => (
              <div key={tx._id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {tx.type === "credit" ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{tx.description || "Earning"}</p>
                    <p className="text-xs text-zinc-600">{new Date(tx.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}</p>
                  </div>
                </div>
                <span className={`text-sm font-black ${tx.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5"><h3 className="text-sm font-bold text-white">Withdrawal Requests</h3></div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {wds.length === 0 ? <p className="text-zinc-600 text-sm text-center py-8">No requests yet</p>
            : wds.map(w => (
              <div key={w._id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2">
                  {wdIcon[w.status] || wdIcon.pending}
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">₹{w.amount}</p>
                    <p className="text-xs text-zinc-600">{w.paymentMethod?.toUpperCase()} · {new Date(w.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold capitalize px-2.5 py-1 rounded-full ${
                  w.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                  w.status === "failed"    ? "bg-red-500/10 text-red-400"         :
                  "bg-amber-500/10 text-amber-400"}`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdraw modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white">Withdraw Funds</h3>
              <button onClick={() => setModal(false)} className="text-zinc-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 font-semibold">Amount (min ₹50)</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="Enter amount" className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-semibold">Method</label>
                <div className="flex gap-2 mt-1">
                  {["upi", "bank"].map(m => (
                    <button key={m} onClick={() => setForm(p => ({ ...p, method: m }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${form.method === m ? "bg-orange-500 border-orange-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {form.method === "upi" && (
                <div>
                  <label className="text-xs text-zinc-500 font-semibold">UPI ID</label>
                  <input type="text" value={form.upiId} onChange={e => setForm(p => ({ ...p, upiId: e.target.value }))}
                    placeholder="yourname@upi" className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500" />
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl text-zinc-400 font-semibold text-sm">Cancel</button>
              <button onClick={handleWithdraw} disabled={!form.amount || busy}
                className="flex-[2] py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-colors">
                {busy ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
