const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Resturant = require("./resturant");
const User = require("./user");

const Order = dbConnection.define('order', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    status: {
        type: DataTypes.ENUM("pending", "preparing", "onTheWay", "delivered", "canceled"),
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true
});

module.exports = Order;