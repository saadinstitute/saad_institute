const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Meal = require("./meal");
const User = require("./user");
const MealUserFav = dbConnection.define('meal_user_fav', {
    mealId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Meal,
            key: "id"
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    isFav: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
},{
    timestamps: true,
    freezeTableName: true
});

module.exports = MealUserFav;