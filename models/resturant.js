const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Delivery = require("./delivery");

const Resturant = dbConnection.define('resturant', {
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
    // userId: {
    //     type: Sequelize.UUID,
    //     allowNull: false,
    //     references: {
    //         model: 'User',
    //         key: 'id'
    //     }
    // },
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
    },
    deliveryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: Delivery,
            key: "id"
        }
    },
      popularity: {
        type: DataTypes.INTEGER,
        allowNull: false,
         defaultValue: 0
    },
},{
    timestamps: true,
    freezeTableName: true
});


module.exports = Resturant;