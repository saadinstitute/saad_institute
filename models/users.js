const { DataTypes } = require("sequelize");

const dbConnection = require("../database/db");

const User = dbConnection.define('Users', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
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
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 18,
            max: 50,
            
        }
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
});

module.exports = User;