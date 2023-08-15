const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Resturant = require('../models/resturant');
//hellowat
//hello
const add_popularity = async (resturant_id, num_of_point, user_id) => {

  // const data = Resturant.findOne();
  try {
    const resturant = await Resturant.findByPk(resturant_id);
    console.log(resturant);
    if (resturant.userId === user_id) {
      console.log("no");
    } else {
      const m = resturant.popularity + num_of_point;
      console.log(resturant_id);
      console.log(m);
      console.log(resturant.arName);
      console.log(resturant.enName);
      console.log(resturant.popularity);
      resturant.popularity = m;
      resturant.save();
    }
  } catch (error) {
console.log(error);
  }

}
module.exports = add_popularity;