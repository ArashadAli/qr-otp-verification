const express = require("express");
const router = express.Router();
const { getMe } = require("../controllers/user.controller.js");

router.get("/me/:id", getMe);

module.exports = router;