const User = require("../models/user.model.js");
const { parseQRData } = require("../services/qr.service.js");
const { successResponse, errorResponse } = require("../utils/apiResponse.js");

/**
 * Format user details for admin response (exclude sensitive fields)
 */
const formatUserForAdmin = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  verificationStatus: user.verificationStatus,
  verifiedAt: user.verifiedAt,
});

/**
 * POST /api/admin/verify/qr
 * Body: { qrData: "<scanned string>" }
 */
const verifyByQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return errorResponse(res, 400, "QR data is required");
    }

    const payload = parseQRData(qrData);

    if (!payload) {
      return errorResponse(res, 400, "Invalid QR code. Please scan a valid user QR code.");
    }

    const user = await User.findOne({ qrToken: payload.token, role: "user" });

    if (!user) {
      return errorResponse(res, 404, "No user found for this QR code. It may have expired.");
    }

    if (user.verificationStatus === "approved") {
      return errorResponse(res, 409, `User "${user.name}" has already been approved.`);
    }

    if (user.verificationStatus === "rejected") {
      return errorResponse(res, 409, `User "${user.name}" has already been rejected.`);
    }

    return successResponse(res, 200, "User found. Please approve or reject.", {
      user: formatUserForAdmin(user),
    });
  } catch (error) {
    console.error("QR verification error:", error);
    return errorResponse(res, 500, "QR verification failed. Please try again.");
  }
};

/**
 * POST /api/admin/verify/otp
 * Body: { otp: "1234" }
 */
const verifyByOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return errorResponse(res, 400, "OTP is required");
    }

    const trimmedOTP = String(otp).trim();

    if (!/^\d{4}$/.test(trimmedOTP)) {
      return errorResponse(res, 400, "OTP must be a 4-digit number");
    }

    const user = await User.findOne({ otp: trimmedOTP, role: "user" });

    if (!user) {
      return errorResponse(res, 404, "Invalid OTP. No matching user found.");
    }

    if (user.verificationStatus === "approved") {
      return errorResponse(res, 409, `User "${user.name}" has already been approved.`);
    }

    if (user.verificationStatus === "rejected") {
      return errorResponse(res, 409, `User "${user.name}" has already been rejected.`);
    }

    return successResponse(res, 200, "User found. Please approve or reject.", {
      user: formatUserForAdmin(user),
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return errorResponse(res, 500, "OTP verification failed. Please try again.");
  }
};

/**
 * POST /api/admin/verification/decision
 * Body: { userId, decision: "approved" | "rejected", adminId }
 */
const makeDecision = async (req, res) => {
  try {
    const { userId, decision, adminId } = req.body;

    if (!userId || !decision) {
      return errorResponse(res, 400, "userId and decision are required");
    }

    if (!["approved", "rejected"].includes(decision)) {
      return errorResponse(res, 400, 'Decision must be "approved" or "rejected"');
    }

    const user = await User.findById(userId);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (user.role !== "user") {
      return errorResponse(res, 403, "Cannot verify an admin account");
    }

    if (user.verificationStatus !== "pending") {
      return errorResponse(
        res,
        409,
        `User has already been ${user.verificationStatus}. No changes made.`
      );
    }

    user.verificationStatus = decision;
    user.verifiedBy = adminId || null;
    user.verifiedAt = new Date();

    await user.save();

    return successResponse(
      res,
      200,
      `User has been ${decision} successfully.`,
      { user: formatUserForAdmin(user) }
    );
  } catch (error) {
    console.error("Decision error:", error);
    return errorResponse(res, 500, "Failed to process decision. Please try again.");
  }
};

module.exports = { verifyByQR, verifyByOTP, makeDecision };