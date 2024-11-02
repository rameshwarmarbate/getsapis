const express = require("express");
const router = express.Router();

const customer = require("../controllers/customer.js");
const { auth } = require("../util/auth.js");

router.get("/api/customers/get-customers", auth, customer.getCustomers);

module.exports = router;
