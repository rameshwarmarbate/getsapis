const { DataTypes } = require("sequelize");
const db = require("../models/database.js");

const Device = db.define(
  "Device",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feature1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feature2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feature3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feature4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    feature5: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon1_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon2_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon3_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image_transparent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_smart_device: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: "device",
    timestamps: true,
    indexes: [
      {
        fields: ["title"],
      },
      {
        fields: ["is_deleted"],
      },
    ],
  }
);

module.exports = Device;
