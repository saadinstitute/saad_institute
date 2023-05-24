const { DataTypes } = require("sequelize");

const dbConnection = require("../database/db");

const Task = dbConnection.define('Tasks', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Task;