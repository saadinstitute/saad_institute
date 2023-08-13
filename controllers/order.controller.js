const BaseResponse = require('../models/base_response');
const Order = require('../models/order');
const Resturant = require('../models/resturant');
const Meal = require('../models/meal');
const User = require('../models/user');
const add_popularity = require('../others/add_popularity');
const OrderMeal = require('../models/order_meal');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../database/db");

const order = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        let { orderDetails } = req.body;
        if (orderDetails.length === 0)
            return res.send(new BaseResponse({ success: false, status: 400, msg: "should be at least one meal" }));
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
        let include = [];
        // const or =await sequelize.query("select * as `order.order_meal.meal` from order",{
        //     nest: true,
        //     type: QueryTypes.SELECT
        // });
        // return res.send(or);
        if (user.role === "admin") {
            const resturant = await Resturant.findOne({ userId: user.id });
            include.push(User);
            include.push({
                model: OrderMeal,
                include: {
                    model: Meal,
                    where: {
                        resturantId: resturant.id
                    }
                },
            });
        }
        if (user.role === "user") {
            query.userId = user.id;
            include.push(OrderMeal);
        }
        if (status !== "");
        query.status = status;
        const data = await Order.findAndCountAll({
            where: query, offset: start * size, limit: size,
            include: include,
            attributes: { exclude: ["userId"] }
        });
        const orders = data.rows;
        const editedOrders = [];
        const ordersCount = data.count;
        if (user.role === "user") {
            for (let i = 0; i < orders.length; i++) {
                editedOrders[i] = JSON.parse(JSON.stringify(orders[i].dataValues));
                const resturantId = editedOrders[i].order_meals[0].meal.resturantId;
                const resturant = await Resturant.findByPk(resturantId);
                editedOrders[i].resturant = resturant;
            }
        }
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
        if (status === "preparing") {
            const theMeal = await Meal.findByPk(order.mealId);
            add_popularity(theMeal.resturantId, 1, "0");
        }
        res.send(new BaseResponse({ data: order, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};



module.exports = { order, getAllOrders, updateStatus };