const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const path = require("path");
const fs = require("fs");

// Log directory path
const logDirectory = path.resolve(__dirname, "../../log");

// Ensure log directory exists, with error handling
try {
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }
} catch (error) {
  console.error("Error creating log directory:", error);
}

// Create a rotating write stream
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // Rotate daily
  path: logDirectory,
  size: "10M", // Maximum size per log file
  compress: "gzip", // Compress log files
  maxFiles: 30, // Keep last 30 days of logs
});

// Custom logging format (optional)
const customFormat =
  ":date[iso] :remote-addr :method :url :status :res[content-length] - :response-time ms";

// Export logging middleware
module.exports = {
  dev: morgan("dev"),
  combined: morgan(customFormat, { stream: accessLogStream }),
};
