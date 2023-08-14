const BaseResponse = require('../models/base_response');
const Order = require('../models/order');
const Reservation = require('../models/reservation');
const Resturant = require('../models/resturant');
const User = require('../models/user');
const Notification = require('../models/notification');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");
const sequelize = require("../database/db");
const sendNotification = require('../others/send_notification');

const reserve = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { resturantId, reserveAt, peapleCount } = req.body;
        const user = await validateUser(req);
        const reserve = await Reservation.create({ resturantId, peaple_count: Number(peapleCount), reserveAt: Date.parse(reserveAt), userId: user.id, status: "pending" });
        const resturantOwner = await sequelize.query(`select u.* from user as u, resturant as r where r.userId = u.id and r.id = "${resturantId}"`, {
            model: User,
            mapToModel: true
          });
        const owner = JSON.parse(JSON.stringify(resturantOwner))[0];
        await sendNotification({token: owner.fbToken, title: "حجز جديد",body: "يرجى قبول او رفض الحجز", userId: owner.id ,resId: reserve.id});
        res.send(new BaseResponse({ data: reserve, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getAllReservations = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0, status = "", resturantId } = req.query;
        const user = await validateUser(req);
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        let include = [Order];
        if (user.role === "admin") {
            query.resturantId = resturantId;
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
        const { status } = req.body;
        const id = req.params.id;
        const reservation = await Reservation.findByPk(id);
        if (status && status !== "") reservation.status = status;
        await reservation.save();
        const client = await User.findByPk(reservation.userId);
        if(status === "accepted"){
            await sendNotification({token: client.fbToken, userId: reservation.userId, title: "تم قبول الحجز", body: "يرجى الوصول على الموعد", resId: reservation.id});
        } else if(status === "canceled"){
            await sendNotification({token: client.fbToken, userId: reservation.userId, title: "عذراً", body: "تم إلغاء الحجز", resId: reservation.id});
        }
        res.send(new BaseResponse({ data: reservation, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { reserve, getAllReservations, updateStatus };