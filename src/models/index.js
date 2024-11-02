const UserDevice = require("../models/userDevice.js");
const Device = require("../models/device.js");
const User = require("../models/user.js");
const SalesPerson = require("../models/salesperson.js");
const Customer = require("../models/customer.js");
const Order = require("../models/order.js");
const OrderCounter = require("../models/orderCounter.js");
const db = require("./database.js");
const { devices, users } = require("../createDump.js");

Device.hasMany(UserDevice, { foreignKey: "device_id" });
UserDevice.belongsTo(Device, { foreignKey: "device_id" });
Order.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});
Customer.hasMany(Order, {
  foreignKey: "customer_id",
  as: "orders",
});
Device.hasMany(Order, {
  foreignKey: "device_id",
  sourceKey: "id",
  as: "orders",
});
Order.belongsTo(Device, {
  foreignKey: "device_id",
  targetKey: "id",
  as: "device",
});

db.sync({ alter: false })
  .then(async () => {
    console.log("Database sync successfully.");
    // const device = await db.models.Device.bulkCreate(devices);
    // console.log(device);
    // const user = await db.models.SalesPerson.bulkCreate(users);
    // console.log(user);
  })
  .catch((err) => {
    console.log(err);

    console.log("Database sync failed.");
  });

module.exports = {
  UserDevice,
  Device,
  User,
  SalesPerson,
  Customer,
  Order,
  OrderCounter,
  sequelize: db,
};
