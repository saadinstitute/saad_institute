const { DataTypes } = require("sequelize");

const dbConnection = require("../database/db");

const Tag = dbConnection.define('Tags', {
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

module.exports = Tag;