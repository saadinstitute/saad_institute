const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const User = dbConnection.define('user', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fatherName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fbToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    joinedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false
    },
    landlinePhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    permanintAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isMarried: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    nationalId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    brothers: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sisters: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    currentWork: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM("male", "female"),
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM("teacher", "tester", "admin", "superAdmin"),
        allowNull: false
    },
    isConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}, {
    timestamps: true,
    freezeTableName: true,
    paranoid: true,
    // defaultScope: {
    //     attributes: {
    //         exclude: ['password']
    //     }
    // }

});


module.exports = User;
