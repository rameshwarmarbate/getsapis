const { DB_HOST, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

const Sequelize = require("sequelize");

const db = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialect: "mysql",
  dialectModule: require("mysql2"),
  timeout: 60000 * 5, // 5 minute
  logging: true,
});

db.authenticate()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.log("Database connection error ", e);
  });

module.exports = db;
