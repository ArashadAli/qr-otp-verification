const express = require("express");
const router = express.Router();
const {
  verifyByQR,
  verifyByOTP,
  makeDecision,
} = require("../controllers/adminVerification.controller.js");

router.post("/verify/qr", verifyByQR);
router.post("/verify/otp", verifyByOTP);
router.post("/verification/decision", makeDecision);

module.exports = router;