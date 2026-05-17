// fixMenuItems.js — run once: node fixMenuItems.js
require("dotenv").config();
const mongoose  = require("mongoose");
const MenuItem  = require("./models/menuItem");
const Restaurant = require("./models/Restaurant");

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const items = await MenuItem.find({
    $or: [
      { restaurant: { $exists: false } },
      { restaurant: null }
    ]
  });

  console.log(`Found ${items.length} items missing restaurant field`);

  let fixed = 0;
  for (const item of items) {
    if (!item.vendor) { console.log(`Skipping ${item.name} — no vendor`); continue; }
    const rest = await Restaurant.findOne({ owner: item.vendor }).select("_id");
    if (rest) {
      await MenuItem.findByIdAndUpdate(item._id, { restaurant: rest._id });
      console.log(`✅ Fixed: ${item.name}`);
      fixed++;
    } else {
      console.log(`⚠️  No restaurant found for vendor ${item.vendor} (item: ${item.name})`);
    }
  }

  console.log(`\nDone. Fixed ${fixed}/${items.length} items.`);
  process.exit(0);
}

fix().catch(err => { console.error(err); process.exit(1); });