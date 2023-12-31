const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
  //path: path.resolve(__dirname, `.env`)
});

module.exports = process.env;