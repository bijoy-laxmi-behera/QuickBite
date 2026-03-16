import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer
} from "recharts";

function Analytics() {

const salesData = [
{ day: "Mon", revenue: 1200 },
{ day: "Tue", revenue: 1500 },
{ day: "Wed", revenue: 1800 },
{ day: "Thu", revenue: 1400 },
{ day: "Fri", revenue: 2100 },
{ day: "Sat", revenue: 2600 },
{ day: "Sun", revenue: 2000 }
];

return ( <div className="p-6">


  {/* Header */}
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Sales Analytics</h1>
    <p className="text-gray-500 text-sm">
      Track revenue and subscriber growth.
    </p>
  </div>


  {/* Stats Cards */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">TOTAL REVENUE</p>
      <h2 className="text-xl font-bold mt-1">₹48,200</h2>
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">ACTIVE SUBSCRIBERS</p>
      <h2 className="text-xl font-bold mt-1">142</h2>
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">ORDERS THIS WEEK</p>
      <h2 className="text-xl font-bold mt-1">324</h2>
    </div>

    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">TOP MEAL</p>
      <h2 className="text-xl font-bold mt-1">Veg Thali</h2>
    </div>

  </div>


  {/* Sales Chart */}
  <div className="bg-white p-6 rounded-xl shadow-sm">

    <h2 className="text-lg font-semibold mb-4">
      Weekly Revenue
    </h2>

    <ResponsiveContainer width="100%" height={300}>

      <LineChart data={salesData}>

        <XAxis dataKey="day" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#f97316"
          strokeWidth={3}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>

</div>

);
}

export default Analytics;
