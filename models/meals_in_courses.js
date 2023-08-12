const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const CourseMeal = require("./course_meal");
const Course = require("./course");

const MealsInCourses = dbConnection.define('meals_in_courses', {
  id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    mealId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "mealId",
        references: {
            model: CourseMeal,
            key: "id"
        }
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: "courseId",
        references: {
            model: Course,
            key: "id"
        }
    },
    calories: {
        type: DataTypes.DOUBLE,
        allowNull: true
    }
},{
    timestamps: true,
    freezeTableName: true
});


module.exports = MealsInCourses;