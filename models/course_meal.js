const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const CourseMeal = dbConnection.define('course_meal', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    arName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    }
},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});


module.exports = CourseMeal;