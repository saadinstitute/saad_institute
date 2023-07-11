const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const CourseMeal = require("./course_meal");
const Course = require("./course");

const MealsInCourses = dbConnection.define('meals_in_courses', {
    mealId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: CourseMeal,
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
    calories: {
        type: DataTypes.DOUBLE,
        allowNull: true
    }
},{
    timestamps: true,
    freezeTableName: true
});


module.exports = MealsInCourses;