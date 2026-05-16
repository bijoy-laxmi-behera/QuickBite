// Run this in backend: node checkSub.js
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const subs = await db.collection("subscriptions").find({}).toArray();
  console.log("Total subscriptions:", subs.length);
  subs.forEach(s => {
    console.log({
      id: s._id,
      user: s.user,
      kitchenId: s.kitchenId,
      vendor: s.vendor,
      status: s.status,
      planType: s.planType,
    });
  });
  mongoose.disconnect();
}).catch(console.error);