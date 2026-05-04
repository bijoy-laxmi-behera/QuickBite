import { useState } from "react";

const agents = [
  { id: 1, name: "Karan Das", phone: "+91 9876543210", city: "Bhubaneswar", status: "active", deliveries: 128, rating: 4.8, current: "QB1022" },
  { id: 2, name: "Ravi Yadav", phone: "+91 9123456780", city: "Cuttack", status: "active", deliveries: 97, rating: 4.6, current: null },
  { id: 3, name: "Sonu Gupta", phone: "+91 9988776655", city: "Puri", status: "inactive", deliveries: 43, rating: 4.3, current: null },
  { id: 4, name: "Bikash Sahoo", phone: "+91 9011223344", city: "Bhubaneswar", status: "active", deliveries: 211, rating: 4.9, current: "QB1023" },
  { id: 5, name: "Deepak Verma", phone: "+91 9765432100", city: "Rourkela", status: "active", deliveries: 76, rating: 4.4, current: null },
];

const liveDeliveries = [
  { orderId: "QB1022", agent: "Karan Das", customer: "Sneha Roy", meal: "Fruit & Nut Salad", pickup: "GreenLeaf, Cuttack", drop: "Sector 5, Cuttack", eta: "12 mins" },
  { orderId: "QB1023", agent: "Bikash Sahoo", customer: "Priya Singh", meal: "Veg Thali Combo", pickup: "Desi Dhaba, Puri", drop: "NH-16, Puri", eta: "8 mins" },
];

export default function DeliveryManagement() {
  const [agentFilter, setAgentFilter] = useState("all");

  const filtered = agents.filter(
    (a) => agentFilter === "all" || a.status === agentFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Delivery Management</h2>
        <p className="text-gray-500 text-sm mt-1">
          {agents.filter((a) => a.status === "active").length} active agents · {liveDeliveries.length} live deliveries
        </p>
      </div>

      {/* Live Deliveries */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-bold text-gray-800">Live Deliveries</h3>
        </div>
        <div className="space-y-3">
          {liveDeliveries.map((d) => (
            <div key={d.orderId} className="flex items-center gap-4 bg-green-50/50 border border-green-100 rounded-xl p-4">
              <div className="text-2xl">🚴</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-gray-800 text-sm">{d.orderId} — {d.meal}</p>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">ETA {d.eta}</span>
                </div>
                <p className="text-xs text-gray-500">Agent: <span className="font-medium text-gray-700">{d.agent}</span> · Customer: {d.customer}</p>
                <p className="text-xs text-gray-400 mt-0.5">📍 {d.pickup} → {d.drop}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Filters */}
      <div className="flex gap-2">
        {["all", "active", "inactive"].map((s) => (
          <button
            key={s}
            onClick={() => setAgentFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              agentFilter === s
                ? "bg-orange-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Agent", "City", "Status", "Total Deliveries", "Rating", "Current Order"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                        {agent.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{agent.name}</p>
                        <p className="text-xs text-gray-400">{agent.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{agent.city}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      agent.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800">{agent.deliveries}</td>
                  <td className="px-5 py-4">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium text-gray-700 ml-1">{agent.rating}</span>
                  </td>
                  <td className="px-5 py-4">
                    {agent.current ? (
                      <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">{agent.current}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
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