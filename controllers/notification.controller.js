const BaseResponse = require('../models/base_response');
const Notification = require('../models/notification');
const { validateAdmin, validateUser, validateSuperAdmin  } = require("../others/validator");
const { Op } = require("sequelize");

const getNotifications = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0} = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        const data = await Notification.findAndCountAll({ where: { userId: user.id }, offset: start * size, limit: size});
        const notifications = data.rows;
        const notificationsCount = data.count;
        res.send(new BaseResponse({ data: notifications, success: true, msg: "success", lang, pagination: {total: notificationsCount, page: start, pageSize: size} }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};


module.exports = { getNotifications };
