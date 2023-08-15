const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const Category = dbConnection.define('category', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
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
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});


module.exports = Category;