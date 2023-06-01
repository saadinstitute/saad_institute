const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const User = dbConnection.define('Users', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        },
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM("male","female"),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("user","admin","superAdmin"),
        allowNull: false
    },
    isConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
});


module.exports = User;