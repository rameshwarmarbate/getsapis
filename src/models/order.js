const db = require("../models/database.js");
const { DataTypes } = require("sequelize");

const Order = db.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    order_no: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    device_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "order",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["order_no"],
      },
      {
        fields: ["customer_id"],
      },
    ],
  }
);

module.exports = Order;
