const db = require("../models/database.js");
const { DataTypes } = require("sequelize");

const Warranty = db.define(
    "Warranty",
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        invoice_number: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        product_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },
        customer_id: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
        },
        date_of_purchase: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        invoice_file: {
            type: DataTypes.STRING(100),
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
        tableName: "warranty",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        indexes: [
            {
                fields: ["invoice_number"],
            },
            {
                fields: ["customer_id"],
            },
        ],
    }
);

module.exports = Warranty;
