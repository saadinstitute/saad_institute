const BaseResponse = require('../models/base_response');
const Order = require('../models/order');
const Reservation = require('../models/reservation');
const Resturant = require('../models/resturant');
const User = require('../models/user');
const Notification = require('../models/notification');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");
const sequelize = require("../database/db");

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
        await Notification.create({ reservationId: reserve.id, userId: resturantOwner.id, title: "حجز جديد", body: "يرجى قبول او رفض الحجز"});
        res.send(new BaseResponse({ data: reserve, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getAllReservations = async (req, res) => {
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
        const { status } = req.body;
        const id = req.params.id;
        const reservation = await Reservation.findByPk(id);
        if (status && status !== "") reservation.status = status;
        await reservation.save();
        if(status === "accepted"){
            await Notification.create({reservationId: reservation.id, userId: reservation.userId, title: "تم قبول الحجز", body: "يرجى الوصول على الموعد"});
        }
        res.send(new BaseResponse({ data: reservation, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { reserve, getAllReservations, updateStatus };