const express = require("express");
const router = express.Router();

const user = require("../controllers/user.js");

router.get("/api/user/:id", user.getUserById);

router.get("/api/user", user.getUsers);

router.post("/api/user", user.newUser);
router.post("/api/login", user.login);
router.post("/api/validate-otp", user.validateOtp);

router.delete("/api/user/:id", user.deleteUser);

router.put("/api/user", user.updateUser);
router.patch("/api/resend-otp", user.resendOtp);

module.exports = router;
