const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");

const Meal = dbConnection.define('Meals', {
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
    categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'Categorys',
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
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
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

module.exports = Meal;