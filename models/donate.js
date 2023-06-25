const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Charity = require("./charity");
const Resturant = require("./resturant");
const User = require("./user");

const Donate = dbConnection.define('donate', {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    charityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Charity,
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true
});

module.exports = Donate;