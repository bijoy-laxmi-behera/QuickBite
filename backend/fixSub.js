require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.db.collection('subscriptions').updateOne(
    { _id: new mongoose.Types.ObjectId('6a08405d468feddd8e21a5c2') },
    { $set: { kitchenId: new mongoose.Types.ObjectId('6a0794e3cd2ffb607df4d482') } }
  );
  console.log('Updated:', result.modifiedCount, 'document(s)');
  mongoose.disconnect();
});