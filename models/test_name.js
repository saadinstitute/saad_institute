const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const TestName = dbConnection.define('test_name', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = TestName;