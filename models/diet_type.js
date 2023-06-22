const { Sequelize, DataTypes } = require("sequelize");
const uuid = require('uuid');
const dbConnection = require("../database/db");

const DietType = dbConnection.define('dietType', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true
});

DietType.beforeCreate(dietType => dietType.id = uuid());
module.exports = DietType;