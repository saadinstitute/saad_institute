const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Student = require("./student");

const Attendance = dbConnection.define('attendance', {
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
    isPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Attendance;