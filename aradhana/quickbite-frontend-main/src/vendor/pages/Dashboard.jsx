import { FaDollarSign, FaClipboardList, FaUsers, FaBox } from "react-icons/fa";

function Dashboard() {
return ( <div className="p-6">


  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">

    <div>
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <p className="text-gray-500 text-sm">
        Welcome back! Here's what's happening with your kitchen today.
      </p>
    </div>

    <div className="flex gap-3 mt-4 md:mt-0">
      <button className="px-4 py-2 bg-gray-200 rounded-lg text-sm">
        Export Report
      </button>

      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
        Manage Subscriptions
      </button>
    </div>

  </div>


  {/* Stats Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

    {/* Total Revenue */}
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">Total Revenue</p>
        <h2 className="text-xl font-bold">$12,450.00</h2>
      </div>
      <div className="bg-orange-100 p-3 rounded-lg text-orange-500">
        <FaDollarSign />
      </div>
    </div>

    {/* Subscription Revenue */}
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">Subscription Revenue</p>
        <h2 className="text-xl font-bold">$8,210.00</h2>
      </div>
      <div className="bg-blue-100 p-3 rounded-lg text-blue-500">
        <FaClipboardList />
      </div>
    </div>

    {/* One-time Orders */}
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">One-time Orders</p>
        <h2 className="text-xl font-bold">$4,240.00</h2>
      </div>
      <div className="bg-green-100 p-3 rounded-lg text-green-500">
        <FaBox />
      </div>
    </div>

    {/* Active Subscribers */}
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">Active Subscribers</p>
        <h2 className="text-xl font-bold">142</h2>
      </div>
      <div className="bg-purple-100 p-3 rounded-lg text-purple-500">
        <FaUsers />
      </div>
    </div>

  </div>


  {/* Middle Section */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

    {/* Today's Schedule */}
    <div className="bg-white p-6 rounded-xl shadow-sm">

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Today's Schedule</h2>
        <span className="text-sm text-gray-500">Oct 24</span>
      </div>

      <div className="space-y-4">

        <div>
          <p className="text-orange-500 text-sm font-semibold">
            CURRENT BATCH
          </p>
          <h3 className="font-medium">15 Lunch Packs</h3>
          <p className="text-gray-500 text-sm">1:00 PM</p>
        </div>

        <div>
          <p className="text-gray-400 text-sm">UPCOMING</p>
          <h3 className="font-medium">8 Keto Bowls</h3>
          <p className="text-gray-500 text-sm">2:30 PM</p>
        </div>

        <div>
          <p className="text-gray-400 text-sm">UPCOMING</p>
          <h3 className="font-medium">22 Family Dinners</h3>
          <p className="text-gray-500 text-sm">6:00 PM</p>
        </div>

      </div>

      <button className="mt-4 w-full border rounded-lg py-2 text-sm">
        View Full Logistics Map
      </button>

    </div>


    {/* Menu Quick View */}
    <div className="bg-white p-6 rounded-xl shadow-sm">

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Menu Quick View</h2>

        <button className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm">
          + Add New Item
        </button>
      </div>

      <table className="w-full text-sm">

        <thead className="text-gray-500">
          <tr>
            <th className="text-left py-2">Dish</th>
            <th className="text-left">Category</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>

          <tr className="border-t">
            <td className="py-3">Grilled Salmon</td>
            <td>Keto Friendly</td>
            <td className="text-green-500">Active</td>
            <td>$18.50</td>
          </tr>

          <tr className="border-t">
            <td className="py-3">Mediterranean Pasta</td>
            <td>Vegetarian</td>
            <td className="text-orange-500">Pending</td>
            <td>$14.20</td>
          </tr>

          <tr className="border-t">
            <td className="py-3">Vegan Tofu Bowl</td>
            <td>Plant-based</td>
            <td className="text-green-500">Active</td>
            <td>$15.75</td>
          </tr>

        </tbody>

      </table>

    </div>

  </div>

{/* Subscriber Directory */}

<div className="bg-white p-6 rounded-xl shadow-sm mt-6">

  <h2 className="font-semibold mb-4">Subscriber Directory</h2>

  <div className="overflow-x-auto">
    <table className="w-full text-sm">


  <thead className="text-gray-500 border-b">
    <tr>
      <th className="text-left py-2">Subscriber</th>
      <th className="text-left">Meal Plan</th>
      <th className="text-left">Diet</th>
      <th className="text-left">Preferred Dish</th>
      <th className="text-left">Vendor Type</th>
      <th className="text-left">Joined</th>
      <th className="text-left">Rating</th>
    </tr>
  </thead>

  <tbody>

    <tr className="border-b">
      <td className="py-3">Rahul Sharma</td>
      <td>Monthly</td>
      <td>Veg</td>
      <td>Dal Rice & Roti Sabzi</td>
      <td className="text-green-600 font-medium">Cloud Kitchen</td>
      <td>Oct 12</td>
      <td>⭐4.7</td>
    </tr>

    <tr className="border-b">
      <td className="py-3">Priya Das</td>
      <td>Weekly</td>
      <td>High Protein</td>
      <td>Paneer Bhurji & Millet Roti</td>
      <td className="text-green-600 font-medium">Cloud Kitchen</td>
      <td>Oct 10</td>
      <td>⭐4.8</td>
    </tr>

    <tr className="border-b">
      <td className="py-3">Arjun Patel</td>
      <td>Premium</td>
      <td>Non-Veg</td>
      <td>Butter Chicken & Naan</td>
      <td className="text-orange-500 font-medium">Restaurant</td>
      <td>Oct 08</td>
      <td>⭐4.5</td>
    </tr>

    <tr className="border-b">
      <td className="py-3">Sneha Gupta</td>
      <td>Monthly</td>
      <td>Vegan</td>
      <td>Vegetable Khichdi</td>
      <td className="text-green-600 font-medium">Cloud Kitchen</td>
      <td>Oct 03</td>
      <td>⭐4.9</td>
    </tr>

    <tr>
      <td className="py-3">Rohit Verma</td>
      <td>Weekly</td>
      <td>Mixed</td>
      <td>Paneer Tikka & Pasta</td>
      <td className="text-orange-500 font-medium">Restaurant</td>
      <td>Oct 01</td>
      <td>⭐4.6</td>
    </tr>

  </tbody>

</table>


  </div>

</div>

  {/* Footer */}
  <div className="mt-10 border-t pt-4 flex flex-col md:flex-row justify-between text-sm text-gray-500">
    <p>© {new Date().getFullYear()} QuickBite Vendor Portal</p>

    <div className="flex gap-4 justify-center mt-2 md:mt-0">
      <span className="hover:text-orange-500 cursor-pointer">Privacy Policy</span>
      <span className="hover:text-orange-500 cursor-pointer">Terms</span>
      <span className="hover:text-orange-500 cursor-pointer">Support</span>
    </div>
  </div>

</div>


);
}

export default Dashboard;
