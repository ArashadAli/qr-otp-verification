const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth.routes.js");
const adminRoutes = require("./src/routes/adminVerification.routes.js");
const userRoutes = require("./src/routes/user.routes.js");
const errorMiddleware = require("./src/middlewares/error.middleware.js");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://qr-otp-verification.vercel.app"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running", timestamp: new Date() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;