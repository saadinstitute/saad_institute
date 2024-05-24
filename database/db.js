const { Sequelize } = require('sequelize');
const config =  require('../config.js');

// const dbConnection = new Sequelize(config.MYSQL_ADDON_DB, config.MYSQL_ADDON_USER, config.MYSQL_ADDON_PASSWORD, {
//     dialect: 'mysql',
//     host: config.MYSQL_ADDON_HOST,
//     port: config.MYSQL_ADDON_PORT,
//     define: {
//         timestamps: false
//     }
//});
const dbConnection = new Sequelize("saad", "root", "123456", {
    dialect: 'mysql',
    host: "localhost",
    username: "root",
    port: "3306",
    password: "123456",
    define: {
        timestamps: false
    }
});

module.exports = dbConnection;
