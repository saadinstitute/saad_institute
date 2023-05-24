const { Sequelize } = require('sequelize');
require('dotenv').config();

// const dbConnection = new Sequelize(process.env.MYSQL_ADDON_URI, { dialect: 'mysql' });

const dbConnection = new Sequelize(process.env.MYSQL_ADDON_DB, process.env.MYSQL_ADDON_USER, process.env.MYSQL_ADDON_PASSWORD, {
    dialect: 'mysql',
    host: process.env.MYSQL_ADDON_HOST,
    port: process.env.MYSQL_ADDON_PORT,
    define: {
        timestamps: false
    }
});

module.exports = dbConnection;
