require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const Subscription = require('./models/Subscription');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const rest = await Restaurant.findOne({ name: /aradhana/i });
  console.log('Restaurant:', rest?._id, rest?.name);

  const subs = await Subscription.find({
    $or: [
      { kitchenId: rest?._id },
      { kitchenId: '6a079414cd2ffb607df4d3be' }
    ]
  });
  console.log('Subscriptions found:', subs.length);
  if (subs.length > 0) console.log('First sub:', JSON.stringify(subs[0], null, 2));
  mongoose.disconnect();
});