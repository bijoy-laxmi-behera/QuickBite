import { useEffect, useState } from "react";
import axios from "axios";
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Plus } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function Support() {
  const [tab, setTab]         = useState("FAQ");
  const [faqs, setFaqs]       = useState([]);
  const [tickets, setTickets] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ subject: "", message: "", category: "other" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
      <div className="flex items-center gap-1 bg-[#0D0D14] border border-white/5 rounded-xl p-1 w-fit">
        {["FAQ","Tickets"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === t ? "bg-orange-500 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* FAQ */}
      {tab === "FAQ" && (
        <div className="space-y-2 max-w-2xl">
          {loading ? [1,2,3].map(i => <div key={i} className="h-14 bg-[#0D0D14] rounded-xl animate-pulse" />) :
          faqs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <HelpCircle size={36} className="text-zinc-800 mb-3" />
              <p className="text-zinc-500 text-sm">No FAQs available</p>
            </div>
          ) : faqs.map(f => (
            <div key={f._id} className="bg-[#0D0D14] border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === f._id ? null : f._id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-semibold text-white pr-4">{f.question}</span>
                {openFaq === f._id
                  ? <ChevronUp size={15} className="text-orange-400 flex-shrink-0" />
                  : <ChevronDown size={15} className="text-zinc-600 flex-shrink-0" />
                }
              </button>
              {openFaq === f._id && (
                <div className="px-5 pb-4 border-t border-white/5 pt-3">
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.answer}</p>
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl text-white font-bold text-sm transition-colors">
              <Plus size={15} /> New Support Ticket
            </button>

            {showForm && (
              <div className="bg-[#0D0D14] border border-orange-500/20 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Create Ticket</h3>
                <div>
                  <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                    {["order","payment","account","delivery","other"].map(c => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">Subject</label>
                  <input type="text" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Brief description"
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wide">Message</label>
                  <textarea rows={3} value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your issue..."
                    className="mt-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 bg-zinc-800 rounded-xl text-zinc-400 font-semibold text-sm">
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

          <div className="bg-[#0D0D14] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">My Tickets</h3>
            </div>
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
              {tickets.length === 0
                ? <p className="text-zinc-600 text-sm text-center py-8">No tickets yet</p>
                : tickets.map(t => (
                  <div key={t._id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-snug">{t.subject}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        t.status === "resolved"    ? "bg-emerald-500/10 text-emerald-400" :
                        t.status === "in_progress" ? "bg-blue-500/10 text-blue-400"       :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-1">{t.message}</p>
                    <p className="text-[10px] text-zinc-700 mt-1">
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