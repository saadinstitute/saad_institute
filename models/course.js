const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const Course = dbConnection.define('course', {
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
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    arDescription: {
        type: DataTypes.STRING,
        allowNull: true
    },
    enDescription: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    timestamps: true,
    freezeTableName: true
});


module.exports = Course;