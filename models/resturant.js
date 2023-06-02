const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const Resturant = dbConnection.define('Resturants', {
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
    userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    openAt: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    closeAt: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    arAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    enAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Resturant;