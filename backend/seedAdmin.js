// fixAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/userModel');

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Hash the password "admin123"
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hashedPassword);
    
    // Update or create admin
    const result = await User.findOneAndUpdate(
      { email: 'admin@gmail.com' },
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        phone: '9999999999',
        isBlocked: false
      },
      { upsert: true, new: true }
    );
    
    console.log('Admin updated/created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Hashed password stored:', result.password);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdmin();