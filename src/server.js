// Patches
const { inject, errorHandler } = require("express-custom-error");
inject(); // Patch express for async/await syntax

// Require Dependencies
const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const engines = require("consolidate");
const path = require("path");
const logger = require("./util/logger");

// Load .env Environment Variables
dotenv.config();

const { PORT = 3000 } = process.env; // Default to 3000 if PORT is not defined

// Instantiate an Express Application
const app = express();

// Configure Express App Instance
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configure custom logger middleware
app.use(logger.dev);
app.use(logger.combined);

app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.engine("html", engines.mustache);
app.set("view engine", "html");

// Middleware to add the JSON header to every response
app.use("*", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Static file serving with caching
app.use(
  "/images/",
  express.static(path.join(__dirname, "..", "data", "images"), {
    maxAge: "1d", // Cache for 1 day
  })
);
app.use(
  "/icons/",
  express.static(path.join(__dirname, "..", "data", "icons"), {
    maxAge: "1d", // Cache for 1 day
  })
);

// Assign Routes
app.use("/", require("./routes/router.js"));
app.get("/", (req, res) => {
  // Specify the HTTP method for the welcome message
  res.send("Welcome to the getsbh API!");
});

// Handle errors
app.use(errorHandler()); // Ensure this is defined correctly

// Handle not valid route
app.use("*", (req, res) => {
  res.status(404).json({ status: false, message: "Endpoint Not Found" });
});

// Open Server on selected Port
app.listen(PORT, () => console.info(`Server listening on port ${PORT}`));
