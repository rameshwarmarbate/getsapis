const express = require("express");
const router = express.Router();

const device = require("../controllers/device.js");
const { auth } = require("../util/auth.js");

router.get("/api/devices", device.getDevices);
router.get("/api/device/get-device-by-name", auth, device.getProductByName);

module.exports = router;
