const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const User = require("./user");
const Order = require("./order");
const Reservation = require("./reservation");

const Notification = dbConnection.define('notification', {
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
    reservationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Reservation,
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
    titleAr: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bodyAr: {
        type: DataTypes.STRING,
        allowNull: false
    },
    titleEn: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bodyEn: {
        type: DataTypes.STRING,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Notification;