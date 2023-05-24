const { DataTypes } = require("sequelize");

const dbConnection = require("../database/db");

const Role = dbConnection.define('Roles', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = Role;