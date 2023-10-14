const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const DayTime = require("./day_time");
const User = require("./user");

const Klass = dbConnection.define('klass', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: "id"
        }
    },
    dayTimeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: DayTime,
            key: "id"
        }
    }
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});


module.exports = Klass;