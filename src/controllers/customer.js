const status = require("http-status");
const { Customer, sequelize } = require("../models");
const { Op } = require("sequelize");

async function getCustomers(req, res) {
  const { name } = req.query;
  const filter = {};
  if (name) {
    filter = {
      ...filter,
      [Op.or]: [
        { first_name: { [Op.iLike]: `%${name}%` } },
        { last_name: { [Op.iLike]: `%${name}%` } },
        sequelize.where(
          fn(
            "concat",
            col("ApiProvider.first_name"),
            " ",
            col("ApiProvider.last_name")
          ),
          {
            [Op.iLike]: `%${name}%`,
          }
        ),
        sequelize.where(
          fn(
            "concat",
            col("ApiProvider.last_name"),
            " ",
            col("ApiProvider.first_name")
          ),
          {
            [Op.iLike]: `%${name}%`,
          }
        ),
      ],
    };
  }

  let data = await Customer.findAll({
    where: filter,
    attributes: ["id", "first_name", "last_name", "mobile"],
  });
  res.json(data);
}
module.exports = { getCustomers };
