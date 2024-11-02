const status = require("http-status");
const { SalesPerson } = require("../models");
const jwt = require("jsonwebtoken");
const has = require("has-keys");
const { verifyPassword, hashPassword } = require("../util");
const { sendResetEmail } = require("../util/mailer");

async function login(req, res) {
  if (!has(req.body, ["email"]) || !has(req.body, ["password"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the email and password.",
    };

  let { email, password } = req.body;

  const user = await SalesPerson.findOne({ where: { email }, raw: true });

  if (!user) {
    throw { code: status.BAD_REQUEST, message: "User not registered." };
  }
  const isVerified = await verifyPassword(password, user.password);
  if (!isVerified) {
    throw { code: status.BAD_REQUEST, message: "Password is incorrect." };
  }
  const { SECRET } = process.env;
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
    expiresIn: "365d",
  });
  const { password: pass, ...restUser } = user;
  res.json({
    status: true,
    message: "User Login successfull.",
    data: { ...restUser, token },
  });
}

async function requestReset(req, res) {
  if (!has(req.body, ["email"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the email and password.",
    };
  const { email } = req.body;
  const user = await SalesPerson.findOne({ where: { email }, raw: true });
  if (!user) {
    throw { code: status.BAD_REQUEST, message: "User not registered." };
  }

  const { SECRET } = process.env;
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
    expiresIn: "1h",
  });
  await sendResetEmail(email, token);
  res.send({ message: "Password reset link sent to your email." });
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  const { SECRET } = process.env;

  const decoded = jwt.verify(token, SECRET);
  const userId = decoded.userId;
  if (!userId) {
    throw { code: status.BAD_REQUEST, message: "Invalid token." };
  }
  const user = await SalesPerson.findByPk(userId);
  if (!user) {
    throw { code: status.BAD_REQUEST, message: "User not found." };
  }
  user.password = await hashPassword(password);
  await user.save();
  res.send({ message: "Password has been reset successfully." });
}

module.exports = {
  login,
  requestReset,
  resetPassword,
};
