const status = require("http-status");

const { Device } = require("../models");

const has = require("has-keys");
const { Op } = require("sequelize");

module.exports = {
  async getDevices(req, res) {
    const { is_smart_device } = req.query;
    let filters = {};
    if (is_smart_device) {
      filters = {
        is_smart_device: is_smart_device === "true",
      };
    }
    let data = await Device.findAll({ where: filters });
    res.json(data);
  },
  async getProductByName(req, res) {
    const { name } = req.query;
    let filters = {};
    if (name) {
      filters = {
        title: { [Op.like]: `%${name}%` },
      };
    }
    let data = await Device.findAll({ where: filters });
    res.json(data);
  },
};
