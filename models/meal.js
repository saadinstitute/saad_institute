const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Resturant = require("./resturant");
const Category = require("./category");

const Meal = dbConnection.define('meal', {
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
    // categoryId: {
    //     type: Sequelize.UUID,
    //     allowNull: false,
    //     references: {
    //         model: 'Category',
    //         key: 'id'
    //     }
    // },
    resturantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Resturant,
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
    discount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
            min: 0.0,
            max: 100.0
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

module.exports = Meal;