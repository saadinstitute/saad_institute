const BaseResponse = require('../models/base_response');
const Order = require('../models/order');
const Reservation = require('../models/reservation');
const Resturant = require('../models/resturant');
const User = require('../models/user');
const OrderMeal = require('../models/order_meal');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const order = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        let { details } = req.body;
        const user = await validateUser(req);
        let order = await Order.create({ userId: user.id, status: "pending" });
        for (let index = 0; index < details.length; index++) {
            let detail = details[index];
            detail.orderId = order.id;
        }
        const orderMeals = await OrderMeal.bulkCreate(details);
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
        let include = [Order];
        if (user.role === "admin") {
            const resturant = await Resturant.findOne({ userId: user.id });
            query.resturantId = resturant.id;
            include.push(User);
        }
        if (user.role === "user") {
            query.userId = user.id;
            include.push(Resturant);
        }
        if (status !== "");
            query.status = status;
        const data = await Reservation.findAndCountAll({ where: query, offset: start * size, limit: size, include: include, attributes: { exclude: ["userId", "resturantId", "orderId"] } });
        const reservations = data.rows;
        const reservationsCount = data.count;
        res.send(new BaseResponse({ data: reservations, success: true, msg: "success", lang, pagination: { total: reservationsCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};


const updateStatus = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        const msg = await validateSuperAdmin(req);
        if (msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang }));
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const charity = await Charity.findOne({ where: { id: data.id } });
        const { arName, enName, enAddress, arAddress, mobile } = data;
        if (arName && arName !== "") charity.arName = arName;
        if (enName && enName !== "") charity.enName = enName;
        if (enAddress && enAddress !== "") charity.enAddress = enAddress;
        if (arAddress && arAddress !== "") charity.arAddress = arAddress;
        if (mobile && mobile !== "") charity.mobile = mobile;
        await charity.save();
        res.send(new BaseResponse({ data: charity, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

// const deleteCharity = async (req, res) => {
//     const lang = req.headers["lang"];
//     try {
//         const msg = await validateSuperAdmin(req);
//         if(msg) return res.send(new BaseResponse({ success: false, status: 403, msg, lang }));
//         if(!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
//         const id = req.params.id;
//         const charity = await Charity.findOne({ where:{ id }});
//         if(!charity) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no charity with the id", lang }));
//         const isSuccess = !(!(await charity.destroy()));
//         res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess?"deleted successfully":"there is someting wrong, please try again later", lang }));
//     } catch (error) {
//         console.log(error);
//         res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
//     }
// };


module.exports = { order, getAllOrders, updateStatus };
