const stats = [
  { label: "Total Revenue", value: "₹1,24,580", change: "+12.4%", up: true, icon: "💰" },
  { label: "Active Orders", value: "348", change: "+8.1%", up: true, icon: "📦" },
  { label: "Total Users", value: "2,841", change: "+5.3%", up: true, icon: "👥" },
  { label: "Active Vendors", value: "62", change: "-2.1%", up: false, icon: "🏪" },
];

const monthlyData = [
  { month: "Aug", revenue: 52000, orders: 210 },
  { month: "Sep", revenue: 67000, orders: 278 },
  { month: "Oct", revenue: 61000, orders: 255 },
  { month: "Nov", revenue: 83000, orders: 312 },
  { month: "Dec", revenue: 95000, orders: 378 },
  { month: "Jan", revenue: 124580, orders: 430 },
];

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

const topMeals = [
  { name: "Grilled Chicken Bowl", orders: 412, revenue: "₹24,720" },
  { name: "Paneer Butter Masala", orders: 389, revenue: "₹21,895" },
  { name: "Veg Thali Combo", orders: 342, revenue: "₹17,100" },
  { name: "Egg Fried Rice", orders: 298, revenue: "₹13,410" },
  { name: "Fruit & Nut Salad", orders: 211, revenue: "₹10,550" },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Revenue & Analytics</h2>
        <p className="text-gray-500 text-sm mt-1">Platform-wide performance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {s.change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-bold text-gray-700 mb-6">Monthly Revenue (₹)</h3>
        <div className="flex items-end gap-3 h-44">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                ₹{(d.revenue / 1000).toFixed(0)}k
              </span>
              <div
                className="w-full bg-orange-400 rounded-t-lg hover:bg-orange-500 transition-colors cursor-pointer"
                style={{ height: `${(d.revenue / maxRevenue) * 160}px` }}
              />
              <span className="text-xs text-gray-500 font-medium">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Meals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-bold text-gray-700 mb-4">Top Performing Meal Plans</h3>
        <div className="space-y-3">
          {topMeals.map((meal, i) => (
            <div key={meal.name} className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-300 w-5">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{meal.name}</span>
                  <span className="text-sm font-bold text-gray-800">{meal.revenue}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${(meal.orders / topMeals[0].orders) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-400 w-16 text-right">{meal.orders} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}