// Payments.jsx
import { useEffect, useState } from "react";
import API from "../../services/axios";
import toast from "react-hot-toast";

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [p, s] = await Promise.all([API.get("/admin/payments"), API.get("/admin/payments/summary")]);
        setPayments(p.data.payments || []);
        setSummary(s.data);
      } catch { toast.error("Failed to load payments"); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRefund = async (id) => {
    if (!confirm("Process refund for this payment?")) return;
    try {
      await API.post(`/admin/payments/${id}/refund`, { reason: "Admin refund" });
      toast.success("Refund processed");
    } catch { toast.error("Refund failed"); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",   value: `₹${(summary?.totalRevenue || 0).toLocaleString()}` },
          { label: "Transactions",    value: summary?.totalTransactions || 0 },
          { label: "Successful",      value: summary?.successfulPayments || 0 },
          { label: "Refunded",        value: `₹${(summary?.refundedAmount || 0).toLocaleString()}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xl font-black text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Order ID", "Customer", "Amount", "Method", "Payment Status", "Date", "Action"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No payments found</td></tr>
              ) : payments.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-bold text-orange-500">#{p._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3 text-gray-700">{p.user?.name || "—"}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">₹{p.totalAmount}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{p.paymentMethod || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.paymentStatus === "paid" ? "bg-green-100 text-green-700"
                      : p.paymentStatus === "refunded" ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>{p.paymentStatus || "pending"}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    {p.paymentStatus === "paid" && (
                      <button onClick={() => handleRefund(p._id)}
                        className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;
