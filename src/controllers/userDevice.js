const status = require("http-status");
const has = require("has-keys");

const userDeviceModel = require("../models/userDevice.js");
const deviceModel = require("../models/device.js");

async function getDevices(req, res) {
  if (!has(req.query, ["user_id"]))
    throw {
      code: status.BAD_REQUEST,
      message: "You must specify the user_id",
    };
  const { user_id } = req.query;
  let data = await userDeviceModel.findAll({
    where: { user_id },
    includes: [
      {
        model: deviceModel,
        required: true,
        as: "deviceDetail",
      },
    ],
  });
  res.json(data);
}
module.exports = { getDevices };
