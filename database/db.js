const { Sequelize } = require('sequelize');
const config =  require('../config.js');

const dbConnection = new Sequelize(config.MYSQL_ADDON_DB, config.MYSQL_ADDON_USER, config.MYSQL_ADDON_PASSWORD, {
    dialect: 'mysql',
    host: config.MYSQL_ADDON_HOST,
    port: config.MYSQL_ADDON_PORT,
    define: {
        timestamps: false
    }
});

module.exports = dbConnection;
