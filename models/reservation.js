const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Charity = require("./charity");
const Resturant = require("./resturant");
const User = require("./user");
const Order = require("./order");

const Reservation = dbConnection.define('reservation', {
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
    resturantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Resturant,
            key: "id"
        }
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Order,
            key: "id"
        }
    },
    reserveAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    peaple_count: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("pending", "accepted", "canceled", "done"),
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Reservation;