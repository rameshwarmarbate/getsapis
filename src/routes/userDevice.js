const express = require("express");
const router = express.Router();

const userDevice = require("../controllers/userDevice.js");

router.get("/api/mydevices", userDevice.getDevices);

module.exports = router;
