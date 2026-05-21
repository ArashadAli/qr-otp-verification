const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // QR & OTP fields (only relevant for role: "user")
    qrToken: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String, // base64 data URL of QR image
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);