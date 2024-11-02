const express = require("express");
const router = express.Router();

const salesPerson = require("../controllers/salesperson.js");

router.post("/api/salesperson/login", salesPerson.login);
router.post("/api/salesperson/request-reset", salesPerson.requestReset);
router.post("/api/salesperson/reset-password", salesPerson.resetPassword);

module.exports = router;
