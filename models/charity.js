const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const Charity = dbConnection.define('charity', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
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
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    arAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    enAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Charity;