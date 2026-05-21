const User = require("../models/user.model.js");

const generateOTP = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

/**
 * Generate a unique OTP not used by any active pending user
 * Falls back to a random one if uniqueness can't be guaranteed after retries
 */
const generateUniqueOTP = async () => {
  let otp;
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    otp = generateOTP();
    const existing = await User.findOne({
      otp,
      verificationStatus: "pending",
      role: "user",
    });
    if (!existing) return otp;
    attempts++;
  }

  // Fallback: return last generated even if not unique
  return otp;
};

module.exports = { generateOTP, generateUniqueOTP };