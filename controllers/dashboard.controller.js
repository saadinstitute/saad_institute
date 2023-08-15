const BaseResponse = require('../models/base_response');
const Category = require('../models/category');
const Resturant = require('../models/resturant');
const User = require('../models/user');
const Meal = require('../models/meal');
const Charity = require('../models/meal');
const { Op } = require("sequelize");
const Delivery = require('../models/delivery');
const Order = require('../models/order');
const Course = require('../models/course');

const getHome = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const resturantsCount = await Resturant.count();
        const usersCount = await User.count();
        const categoriesCount = await Category.count();
        const mealsCount = await Meal.count();
        const charityCount = await Charity.count();
        const ordersCount = await Order.count();
        const deliveryCount = await Delivery.count();
        const courseCount = await Course.count();
        let data = {resturantsCount, usersCount, categoriesCount, charityCount, mealsCount, ordersCount, deliveryCount, courseCount};
        res.send(new BaseResponse({data, success: true, msg: "success", lang}));
    } catch (error) {
        res.send(new BaseResponse({success: false, msg: error, lang}));
    }
};


module.exports = { getHome };
