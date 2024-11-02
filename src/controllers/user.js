const status = require("http-status");

const userModel = require("../models/user.js");
const jwt = require("jsonwebtoken");

const has = require("has-keys");
const { generateOTP } = require("../util");
const { sendOtp } = require("../util/mailer");

async function getUserById(req, res) {
  if (!has(req.params, "id"))
    throw { code: status.BAD_REQUEST, message: "You must specify the id" };

  let { id } = req.params;

  let data = await userModel.findOne({ where: { id } });

  if (!data) throw { code: status.BAD_REQUEST, message: "User not found" };

  res.json({ status: true, message: "Returning user", data });
}
async function getUsers(req, res) {
  let data = await userModel.findAll();

  res.json({ status: true, message: "Returning users", data });
}
async function newUser(req, res) {
  if (!has(req.body, ["name", "email", "mobile"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the name, email and mobile",
    };
  let { name, email, mobile } = req.body;
  const user = await userModel.findOne({ where: { email } });

  if (user) {
    throw { code: status.BAD_REQUEST, message: "Email already registered." };
  }

  await userModel.create({ name, email, mobile });

  res.json({ status: true, message: "User Added" });
}
async function login(req, res) {
  if (!has(req.body, ["email"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the email",
    };

  let { email } = req.body;

  const user = await userModel.findOne({ where: { email }, raw: true });

  if (!user) {
    throw { code: status.BAD_REQUEST, message: "User not found" };
  }
  const otp = generateOTP();
  await userModel.update({ otp }, { where: { id: user.id } });
  sendOtp(otp, email);
  const { otp: prevOtp, ...rest } = user;
  res.json({ status: true, message: "User Login", data: rest });
}
async function resendOtp(req, res) {
  if (!has(req.body, ["id"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the id",
    };

  let { id } = req.body;

  const otp = generateOTP();
  await userModel.update({ otp }, { where: { id } });
  const user = await userModel.findByPk(id, { raw: true });
  sendOtp(otp, user.email);
  const { otp: prevOtp, ...rest } = user;
  res.json({ status: true, message: "User Login", data: rest });
}
async function validateOtp(req, res) {
  if (!has(req.body, ["id"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the id",
    };

  let { id, otp } = req.body;

  const user = await userModel.findOne({ where: { id }, raw: true });

  if (otp !== user.otp) {
    throw { code: status.BAD_REQUEST, message: "Invalid OTP" };
  }
  const { SECRET } = process.env;
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
    expiresIn: "365d",
  });

  res.json({
    status: true,
    message: "User Login successfull.",
    data: { ...user, token },
  });
}
async function updateUser(req, res) {
  if (!has(req.body, ["id", "name", "email"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the id, name and email",
    };

  let { id, name, email } = req.body;

  await userModel.update({ name, email }, { where: { id } });

  res.json({ status: true, message: "User updated" });
}
async function deleteUser(req, res) {
  if (!has(req.params, "id"))
    throw { code: status.BAD_REQUEST, message: "You must specify the id" };

  let { id } = req.params;

  await userModel.destroy({ where: { id } });

  res.json({ status: true, message: "User deleted" });
}

module.exports = {
  newUser,
  deleteUser,
  updateUser,
  getUsers,
  validateOtp,
  login,
  getUserById,
  resendOtp,
};
