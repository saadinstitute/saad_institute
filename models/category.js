const { DataTypes } = require("sequelize");

const dbConnection = require("../database/db");

const Category = dbConnection.define('Categories', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    arName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    enName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
});

module.exports = Category;