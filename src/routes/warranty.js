const express = require("express");
const router = express.Router();

const warranty = require("../controllers/warrantyClaim.js");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "..", "data", "uploads", "invoice_file");
        console.log(uploadPath);

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Unique file name
    },
});

const upload = multer({ storage: storage });

router.post("/api/warranty/register-warranty-claim", upload.single("invoice_file"), warranty.registerWarrantyClaim);

module.exports = router;