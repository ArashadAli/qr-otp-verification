const User = require("../models/user.model.js");
const { successResponse, errorResponse } = require("../utils/apiResponse.js");

/**
 * GET /api/users/me/:id
 * Fetch current user's status (used for polling on user dashboard)
 */
const getMe = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "name email role otp qrCode verificationStatus verifiedAt"
    );

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (user.role !== "user") {
      return errorResponse(res, 403, "Endpoint is for users only");
    }

    return successResponse(res, 200, "User fetched successfully", { user });
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse(res, 500, "Failed to fetch user data");
  }
};

module.exports = { getMe };