const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const DayTime = dbConnection.define('day_time', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    beginAt: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endAt: {
        type: DataTypes.TIME,
        allowNull: false
    },
    sunday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    monday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    tuesday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    wednesday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    Thursday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    Friday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    saturday: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});


module.exports = DayTime;