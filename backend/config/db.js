import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin user if database is empty
    const User = (await import('../models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚠️ No users found in database, seeding default admin user...');
      const adminUser = await User.create({
        name: 'moreez poly',
        email: 'moreezpoly@gmail.com',
        password: process.env.ADMIN_DEFAULT_PASSWORD || 'password123',
        role: 'admin'
      });
      console.log(`✅ Default admin created: ${adminUser.email}`);
    }

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
