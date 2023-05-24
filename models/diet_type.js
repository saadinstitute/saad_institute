const { DataTypes } = require("sequelize");

const dbConnection = require("../database/db");

const DietType = dbConnection.define('DietTypes', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

module.exports = DietType;