const User = require("../models/user.model.js");
const { generateQRToken, generateQRCode } = require("../services/qr.service.js");
const { generateUniqueOTP } = require("../services/otp.service.js");
const { successResponse, errorResponse } = require("../utils/apiResponse.js");

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    if (user.password !== password) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    // If user role, generate fresh QR + OTP on every login
    if (user.role === "user") {
      const qrToken = generateQRToken();
      const otp = await generateUniqueOTP();
      const qrCode = await generateQRCode(qrToken);

      user.qrToken = qrToken;
      user.otp = otp;
      user.qrCode = qrCode;
      user.verificationStatus = "pending";
      user.verifiedBy = null;
      user.verifiedAt = null;

      await user.save();

      return successResponse(res, 200, "Login successful", {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        qrCode: user.qrCode,
        otp: user.otp,
        verificationStatus: user.verificationStatus,
      });
    }

    // Admin login - no QR/OTP
    return successResponse(res, 200, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Login failed. Please try again.");
  }
};

module.exports = { login };