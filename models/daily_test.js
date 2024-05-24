const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Student = require("./student");

const DailyTest = dbConnection.define('daily_test', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    studentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Student,
            key: 'id'
        }
    },
    part: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    mark: {
        type: DataTypes.ENUM("good", "accepted", "bad"),
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = DailyTest;