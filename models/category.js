const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const Category = dbConnection.define('category', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});


module.exports = Category;