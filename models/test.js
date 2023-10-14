const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Student = require("./student");
const User = require("./user");
const TestName = require("./test_name");

const Test = dbConnection.define('test', {
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
    teacherId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    testerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    testNameId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: TestName,
            key: 'id'
        }
    },
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Test;