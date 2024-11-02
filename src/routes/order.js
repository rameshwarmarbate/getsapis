const express = require("express");
const router = express.Router();

const order = require("../controllers/order.js");
const { auth } = require("../util/auth.js");

router.post("/api/orders/create_order", auth, order.addOrder);
router.get("/api/orders/order-list", auth, order.getOrders);
router.get("/api/orders/download-invoice", auth, order.downloadInvoice);

module.exports = router;
