const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Student = require("./student");

const WaqfTest = dbConnection.define('waqf_test', {
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
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sort: {
        type: DataTypes.INTEGER,
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

module.exports = WaqfTest;