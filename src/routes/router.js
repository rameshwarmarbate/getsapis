const router = require("express").Router();

// Users routes

router.use(require("../routes/user"));
router.use(require("../routes/device"));
router.use(require("../routes/userDevice"));
router.use(require("../routes/salesperson"));
router.use(require("../routes/order"));
router.use(require("../routes/customer"));
router.use(require("../routes/warranty"));
module.exports = router;
