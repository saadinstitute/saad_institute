const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Test = require("./test");

const TestMark = dbConnection.define('test_mark', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    mark: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    testId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Test,
            key: 'id'
        }
    }
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = TestMark;