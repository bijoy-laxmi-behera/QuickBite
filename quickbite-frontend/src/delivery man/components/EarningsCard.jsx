const EarningsCard = ({ amount, label }) => {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-bold">₹{amount}</h2>
      <p className="text-gray-500">{label}</p>
    </div>
  );
};

export default EarningsCard;