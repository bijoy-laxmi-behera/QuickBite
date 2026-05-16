import { useEffect, useState } from "react";
import axios from "axios";
import { HelpCircle, ChevronDown, ChevronUp, Plus } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Support() {
  const [tab, setTab]           = useState("FAQ");
  const [faqs, setFaqs]         = useState([]);
  const [tickets, setTickets]   = useState([]);
  const [openFaq, setOpenFaq]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ subject: "", message: "", category: "other" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]   = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/delivery/support/faqs`,    { headers: h }),
      axios.get(`${API}/delivery/support/tickets`, { headers: h }),
    ])
      .then(([f, t]) => {
        setFaqs(Array.isArray(f.data?.data    ?? f.data)    ? (f.data?.data    ?? f.data)    : []);
        setTickets(Array.isArray(t.data?.data ?? t.data)    ? (t.data?.data    ?? t.data)    : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/delivery/support/ticket`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(p => [data?.data || data, ...p]);
      setShowForm(false);
      setTab("Tickets");
      setForm({ subject: "", message: "", category: "other" });
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
        {["FAQ","Tickets"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t ? "bg-orange-500 text-white" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* FAQ */}
      {tab === "FAQ" && (
        <div className="space-y-2 max-w-2xl">
          {loading ? [1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />) :
          faqs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <HelpCircle size={36} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No FAQs available</p>
            </div>
          ) : faqs.map(f => (
            <div key={f._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === f._id ? null : f._id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">{f.question}</span>
                {openFaq === f._id
                  ? <ChevronUp size={15} className="text-orange-500 flex-shrink-0" />
                  : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
                }
              </button>
              {openFaq === f._id && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed">{f.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tickets */}
      {tab === "Tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <button onClick={() => setShowForm(p => !p)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold text-sm transition-colors shadow-md shadow-orange-500/20">
              <Plus size={15} /> New Support Ticket
            </button>

            {showForm && (
              <div className="bg-white border border-orange-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900">Create Ticket</h3>
                <div>
                  <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors">
                    {["order","payment","account","delivery","other"].map(c => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Subject</label>
                  <input type="text" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Brief description"
                    className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Message</label>
                  <textarea rows={3} value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your issue..."
                    className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 resize-none transition-colors" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold text-sm hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button onClick={submit} disabled={!form.subject || !form.message || submitting}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-colors">
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">My Tickets</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {tickets.length === 0
                ? <p className="text-gray-400 text-sm text-center py-8">No tickets yet</p>
                : tickets.map(t => (
                  <div key={t._id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{t.subject}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                        t.status === "resolved"    ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        t.status === "in_progress" ? "bg-blue-50 border-blue-200 text-blue-600"          :
                        "bg-amber-50 border-amber-200 text-amber-600"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{t.message}</p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                    </p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
