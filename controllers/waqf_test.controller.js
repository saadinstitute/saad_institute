const BaseResponse = require('../models/base_response');
const WaqfTest = require('../models/waqf_test');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addWaqfTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        const waqftest = await WaqfTest.create(req.body);
        res.send(new BaseResponse({ data: waqftest, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getStudentWaqfTests = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0,  studentId } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        const query = { studentId };
        const data = await WaqfTest.findAndCountAll({
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

const updateWaqfTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateUser(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const waqftest = await WaqfTest.findByPk(data.id);
        const { studentId, mark, part, date,sort} = data;
        waqftest.studentId = studentId;
        waqftest.mark = mark;
        waqftest.date = date;
        waqftest.part = part;
        waqftest.sort = sort;
        await waqftest.save();
        res.send(new BaseResponse({ data: waqftest, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteWaqfTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const waqftest = await WaqfTest.findByPk(id);
        if (!waqftest) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no waqftest with this id", lang }));
        const isSuccess = !(!(await waqftest.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addWaqfTest, getStudentWaqfTests, updateWaqfTest, deleteWaqfTest };
