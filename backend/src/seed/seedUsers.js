require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const connectDB = require("../config/db.js");

const seedUsers = async () => {
  await connectDB();

  console.log("🌱 Starting seed...");

  // Clear existing users
  await User.deleteMany({});
  console.log("🗑️  Cleared existing users");

  const usersToInsert = [];

  // Create admin
  usersToInsert.push({
    name: "System Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  });

  // Create 50 users
  for (let i = 1; i <= 50; i++) {
    usersToInsert.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: "user123",
      role: "user",
      verificationStatus: "pending",
    });
  }

  await User.insertMany(usersToInsert);

  console.log(`✅ Seeded 1 admin and 50 users successfully`);
  console.log("\n📋 Demo Credentials:");
  console.log("   Admin  → admin@example.com / admin123");
  console.log("   User   → user1@example.com  / user123");
  console.log("           (user1 through user50)\n");

  await mongoose.connection.close();
  console.log("🔌 Database connection closed");
  process.exit(0);
};

seedUsers().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});