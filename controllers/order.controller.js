const BaseResponse = require('../models/base_response');
const Order = require('../models/order');
const Resturant = require('../models/resturant');
const User = require('../models/user');
const OrderMeal = require('../models/order_meal');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const order = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        let { orderDetails } = req.body;
        const user = await validateUser(req);
        let order = await Order.create({ userId: user.id, status: "pending" });
        for (let index = 0; index < orderDetails.length; index++) {
            let detail = orderDetails[index];
            detail.orderId = order.id;
        }
        const orderMeals = await OrderMeal.bulkCreate(orderDetails);
        order.details = orderMeals;
        res.send(new BaseResponse({ data: order, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getAllOrders = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0, status = "" } = req.query;
        const user = await validateUser(req);
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        let include = [OrderMeal];
        if (user.role === "admin") {
            const resturant = await Resturant.findOne({ userId: user.id });
            query.resturantId = resturant.id;
            include.push(User);
        }
        if (user.role === "user") {
            query.userId = user.id;
            // include.push(Resturant);
        }
        if (status !== "");
            query.status = status;
        const data = await Order.findAndCountAll({ where: query, offset: start * size, limit: size, include: include, attributes: { exclude: ["userId", "resturantId", "orderId"] } });
        const orders = data.rows;
        const ordersCount = data.count;
        res.send(new BaseResponse({ data: orders, success: true, msg: "success", lang, pagination: { total: ordersCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};


const updateStatus = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { status } = req.body;
        const id = req.params.id;
        const order = await Order.findByPk(id);
        if (status && status !== "") order.status = status;
        await order.save();
        res.send(new BaseResponse({ data: order, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};



module.exports = { order, getAllOrders, updateStatus };
