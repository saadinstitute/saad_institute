const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Meal = require("./meal");
const Order = require("./order");

const OrderMeal = dbConnection.define('order_meal', {
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Order,
            key: "id"
        }
    },
    mealId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Meal,
            key: "id"
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true
});

module.exports = Order;