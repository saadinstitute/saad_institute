const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Course = require("./course");
const User = require("./user");

const CourseUser = dbConnection.define('course_user', {
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Course,
            key: "id"
        }
    },
    beginAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true
});


module.exports = CourseUser;