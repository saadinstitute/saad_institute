const BaseResponse = require('../models/base_response');
const DayTime = require('../models/day_time');
const { validateSuperAdmin } = require("../others/validator");

const addDayTime = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateSuperAdmin(req);
        const daytime = await DayTime.create(data);
        res.send(new BaseResponse({ data: daytime, success: true, msg: "success" }));
    } catch (error) {
        // console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getDayTimes = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        // const { pageSize, page, search } = req.query;
        // const size = Number(pageSize) ?? 10;
        // const start = Number(page) ?? 0;
        // const data = await DayTime.findAndCountAll({where: query, offset: start * size, limit: size });
        const data = await DayTime.findAndCountAll();
        const daytimes = data.rows;
        // const daytimesCount = data.count;
        res.send(new BaseResponse({ data: daytimes, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateDayTime = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateSuperAdmin(req);
        const data = req.body;
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "id field is required", lang }));
        const daytime = await DayTime.findByPk(data.id);
        if (!daytime) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no daytime with the id", lang }));
        const { beginAt, endAt, sunday, monday, tuesday, wednesday, Thursday, Friday, saturday } = data;
        daytime.beginAt = beginAt;
        daytime.endAt = endAt;
        daytime.sunday = sunday;
        daytime.monday = monday;
        daytime.tuesday = tuesday;
        daytime.wednesday = wednesday;
        daytime.Thursday = Thursday;
        daytime.Friday = Friday;
        daytime.saturday = saturday;
        await daytime.save();
        res.send(new BaseResponse({ data: daytime, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteDayTime = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateSuperAdmin(req);
        if (!req.params.id)
            return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const daytime = await DayTime.findByPk(id);
        if (!daytime)
            return res.send(new BaseResponse({ success: false, status: 404, msg: `there is no daytime with the id`, lang }));
        const isSuccess = !(!(await daytime.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};



module.exports = { addDayTime, getDayTimes, updateDayTime, deleteDayTime };
