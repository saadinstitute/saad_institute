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
const sendNotification = require('../others/send_notification');

const order = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        let { orderDetails, resturantId } = req.body;
        if (orderDetails.length === 0)
            return res.send(new BaseResponse({ success: false, status: 400, msg: "should be at least one meal" }));
        const user = await validateUser(req);
        let order = await Order.create({ userId: user.id, status: "pending", resturantId });
        for (let index = 0; index < orderDetails.length; index++) {
            let detail = orderDetails[index];
            detail.orderId = order.id;
        }
        const orderMeals = await OrderMeal.bulkCreate(orderDetails);
        order.details = orderMeals;
        const resturant = await Resturant.findByPk(resturantId);
        const resturantOwner = await User.findByPk(resturant.userId);
        await sendNotification({token: resturantOwner.fbToken, title: "طلبية جديدة",body: "يرجى قبول الطلبية والبدء بتحضيرها", userId: resturant.userId ,orderId: order.id});
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
                    },
                },
            });
        }
        if (user.role === "user") {
            query.userId = user.id;
            include.push(Order);
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
        res.send(new BaseResponse({ data: user.role === "user"?editedOrders:orders, success: true, msg: "success", lang, pagination: { total: ordersCount, page: start, pageSize: size } }));
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
        const client = await User.findByPk(order.userId);
        if (status === "preparing") {
            const theMeal = await Meal.findByPk(order.mealId);
            add_popularity(theMeal.resturantId, 1, "0");
            await sendNotification({token: client.fbToken, title: "إشعار طلبية",body: "تم البدء بتحضير الطبية", userId: client.id ,orderId: order.id});
        } else if(status === "onTheWay"){
            await sendNotification({token: client.fbToken, title: "إشعار طلبية",body: "تم الانتهاء من تحضير الطلبية وهي في طريقها اليك", userId: client.id ,orderId: order.id});
        } else if(status === "delivered"){
            await sendNotification({token: client.fbToken, title: "إشعار طلبية",body: "تم توصيل الطلبية", userId: client.id ,orderId: order.id});
        } else if(status === "canceled"){
            await sendNotification({token: client.fbToken, title: "إشعار طلبية",body: "تم الغاء الطلبية", userId: client.id ,orderId: order.id});
        }
        res.send(new BaseResponse({ data: order, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};



module.exports = { order, getAllOrders, updateStatus };