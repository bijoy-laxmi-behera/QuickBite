function StatusBadge({ status }) {
  const colors = {
    available: "bg-gray-300",
    assigned: "bg-blue-400",
    picked: "bg-yellow-400",
    on_the_way: "bg-purple-500",
    delivered: "bg-green-500",
  };

  return (
    <span className={`px-3 py-1 text-white text-xs rounded ${colors[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default StatusBadge;