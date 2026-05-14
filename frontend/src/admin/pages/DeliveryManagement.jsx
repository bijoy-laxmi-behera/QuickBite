// DeliveryManagement.jsx
import { useEffect, useState } from "react";
import API from "../../services/axios";
import { Truck, Plus, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function DeliveryManagement() {
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", email: "", password: "", phone: "" });

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/agents");
      setAgents(res.data.agents || []);
    } catch { toast.error("Failed to load agents"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast.error("Fill required fields"); return; }
    try {
      await API.post("/admin/agents", form);
      toast.success("Agent created");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", phone: "" });
      fetchAgents();
    } catch { toast.error("Create failed"); }
  };

  const handleToggle = async (id) => {
    try {
      await API.patch(`/admin/agents/${id}/status`);
      fetchAgents();
    } catch { toast.error("Toggle failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this agent?")) return;
    try {
      await API.delete(`/admin/agents/${id}`);
      toast.success("Agent deleted");
      fetchAgents();
    } catch { toast.error("Delete failed"); }
  };

  const filtered = agents.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-3 justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 w-56"
          />
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
          <Plus size={15} /> Add Agent
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Agent", "Email", "Phone", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No delivery agents found</td></tr>
                ) : filtered.map(agent => (
                  <tr key={agent._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                          {agent.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-800">{agent.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{agent.email}</td>
                    <td className="px-5 py-3 text-gray-400">{agent.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${agent.isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {agent.isOnline ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(agent._id)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 transition">
                          {agent.isOnline ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => handleDelete(agent._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">Add Delivery Agent</h3>
            {[
              { key: "name", label: "Full Name *", type: "text" },
              { key: "email", label: "Email *", type: "email" },
              { key: "password", label: "Password *", type: "password" },
              { key: "phone", label: "Phone", type: "text" },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{field.label}</label>
                <input type={field.type} value={form[field.key]} onChange={e => setForm({...form, [field.key]: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCreate}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
