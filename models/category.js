const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Meal = require("./meal");

const Category = dbConnection.define('Categories', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
    },
    arName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    enName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
});

// Category.associations = function(models){
//     Category.hasMany(models.Category, {foreignKey: 'id',sourceKey: 'categoryId'});
// };

module.exports = Category;