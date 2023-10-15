const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Student = require("./student");

const Absence = dbConnection.define('absence', {
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
    beginAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    endAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Absence;