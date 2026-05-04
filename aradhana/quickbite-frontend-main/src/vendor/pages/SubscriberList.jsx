function SubscriberList() {

const subscribers = [
{
id: 1,
name: "Rahul Sharma",
plan: "Monthly",
diet: "Veg",
vendor: "Cloud Kitchen",
joined: "Oct 12",
rating: "4.7"
},
{
id: 2,
name: "Priya Das",
plan: "Weekly",
diet: "High Protein",
vendor: "Cloud Kitchen",
joined: "Oct 10",
rating: "4.8"
},
{
id: 3,
name: "Arjun Patel",
plan: "Premium",
diet: "Non-Veg",
vendor: "Restaurant",
joined: "Oct 08",
rating: "4.5"
},
{
id: 4,
name: "Sneha Gupta",
plan: "Monthly",
diet: "Vegan",
vendor: "Cloud Kitchen",
joined: "Oct 03",
rating: "4.9"
}
];

return ( <div className="p-6">


  {/* Header */}
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Subscriber List</h1>
    <p className="text-gray-500 text-sm">
      View all customers subscribed to your meals.
    </p>
  </div>


  {/* Table */}
  <div className="bg-white rounded-xl shadow-sm p-6">

    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="text-gray-500 border-b">

          <tr>
            <th className="text-left py-2">Subscriber</th>
            <th className="text-left">Meal Plan</th>
            <th className="text-left">Diet</th>
            <th className="text-left">Vendor Type</th>
            <th className="text-left">Joined</th>
            <th className="text-left">Rating</th>
          </tr>

        </thead>

        <tbody>

          {subscribers.map((sub) => (
            <tr key={sub.id} className="border-b">

              <td className="py-3">{sub.name}</td>

              <td>{sub.plan}</td>

              <td>{sub.diet}</td>

              <td>{sub.vendor}</td>

              <td>{sub.joined}</td>

              <td>⭐ {sub.rating}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>

</div>


);
}

export default SubscriberList;
