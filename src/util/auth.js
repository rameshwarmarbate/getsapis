const jwt = require("jsonwebtoken");
const status = require("http-status");

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(status.UNAUTHORIZED)
      .json({ message: "No token provided" });
  }

  // Check for Bearer token format
  const parts = token.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(status.BAD_REQUEST) // Token format is incorrect
      .json({ message: "Invalid token format" });
  }

  const actualToken = parts[1]; // Get the actual token

  try {
    const { SECRET } = process.env;
    const decodedToken = jwt.verify(actualToken, SECRET);
    req.userData = { userId: decodedToken.userId, email: decodedToken.email };
    next();
  } catch (error) {
    let message = "Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Token has expired";
    }
    return res.status(status.UNAUTHORIZED).json({ message });
  }
}

module.exports = {
  auth,
};
