export const mockOrders = [
  {
    id: "ORD001",
    customerName: "Rahul Sharma",
    address: "KIIT Square, Bhubaneswar",
    items: ["Burger", "Coke"],
    amount: 250,
    distance: "2.5 km",
    status: "available", // available | assigned | picked | on_the_way | delivered
  },
  {
    id: "ORD002",
    customerName: "Ankit Singh",
    address: "Patia, Bhubaneswar",
    items: ["Pizza"],
    amount: 450,
    distance: "3 km",
    status: "assigned",
  }
];