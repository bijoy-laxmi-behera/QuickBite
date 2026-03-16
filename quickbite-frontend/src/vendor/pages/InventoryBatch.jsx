function InventoryBatch() {

const batches = [
{
meal: "Breakfast",
items: "Poha + Tea",
quantity: 35,
time: "8:00 AM"
},
{
meal: "Lunch",
items: "Dal Rice + Sabzi",
quantity: 72,
time: "1:00 PM"
},
{
meal: "Dinner",
items: "Roti Paneer + Rice",
quantity: 48,
time: "7:30 PM"
}
];

const inventory = [
{ item: "Rice", stock: "25 kg", status: "Good" },
{ item: "Dal", stock: "8 kg", status: "Low" },
{ item: "Paneer", stock: "5 kg", status: "Low" },
{ item: "Vegetables", stock: "20 kg", status: "Good" }
];

return ( <div className="p-6">


  {/* Header */}
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Inventory & Batch Cooking</h1>
    <p className="text-gray-500 text-sm">
      Manage meal preparation and kitchen inventory.
    </p>
  </div>


  {/* Batch Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

    {batches.map((batch, index) => (
      <div
        key={index}
        className="bg-white rounded-xl shadow-sm p-5"
      >

        <h3 className="text-lg font-semibold mb-2">
          {batch.meal}
        </h3>

        <p className="text-gray-500 text-sm">
          {batch.items}
        </p>

        <p className="mt-3 text-sm">
          Quantity: <span className="font-semibold">{batch.quantity}</span>
        </p>

        <p className="text-sm text-gray-500">
          Time: {batch.time}
        </p>

        <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
          Update Batch
        </button>

      </div>
    ))}

  </div>


  {/* Inventory Table */}
  <div className="bg-white rounded-xl shadow-sm p-6">

    <h2 className="text-lg font-semibold mb-4">
      Ingredient Inventory
    </h2>

    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="text-gray-500 border-b">
          <tr>
            <th className="text-left py-2">Ingredient</th>
            <th className="text-left">Stock</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>

        <tbody>

          {inventory.map((item, index) => (
            <tr key={index} className="border-b">

              <td className="py-3">{item.item}</td>

              <td>{item.stock}</td>

              <td>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === "Low"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.status}
                </span>
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

export default InventoryBatch;
