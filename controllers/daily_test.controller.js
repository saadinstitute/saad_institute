const BaseResponse = require('../models/base_response');
const DailyTest = require('../models/daily_test');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addDailyTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        const dailytest = await DailyTest.create(req.body);
        res.send(new BaseResponse({ data: dailytest, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getStudentDailyTests = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0,  studentId } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        const query = { studentId };
        const data = await DailyTest.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
        });
        const rows = data.rows;
        const count = data.count;
        res.send(new BaseResponse({ data: rows, success: true, msg: "success", lang, pagination: { total: count, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const updateDailyTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateUser(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const dailytest = await DailyTest.findByPk(data.id);
        const { studentId, mark, part} = data;
        dailytest.studentId = studentId;
        dailytest.mark = mark;
        dailytest.part = part;
        await dailytest.save();
        res.send(new BaseResponse({ data: dailytest, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteDailyTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const dailytest = await DailyTest.findByPk(id);
        if (!dailytest) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no dailytest with this id", lang }));
        const isSuccess = !(!(await dailytest.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addDailyTest, getStudentDailyTests, updateDailyTest, deleteDailyTest };
