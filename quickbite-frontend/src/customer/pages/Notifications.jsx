function Notifications() {
  const data = [
    "Your order has been delivered 🎉",
    "50% OFF on subscriptions today 🔥",
  ];

  return (
    <div className="p-4">
      <h2 className="font-bold mb-3">Notifications</h2>

      {data.map((n, i) => (
        <div key={i} className="bg-white p-3 mb-2 rounded shadow">
          {n}
        </div>
      ))}
    </div>
  );
}

export default Notifications;