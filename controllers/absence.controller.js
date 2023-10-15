const BaseResponse = require('../models/base_response');
const Absence = require('../models/absence');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addAbsence = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        const data = await Absence.create(req.body);
        res.send(new BaseResponse({ data, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getStudentAbsences = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0,  studentId } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        const query = { studentId };
        const data = await Absence.findAndCountAll({
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

const updateAbsence = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const body = req.body;
        await validateUser(req);
        if (!body.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const data = await Absence.findByPk(body.id);
        const { studentId, beginAt, endAt, reason } = body;
        data.studentId = studentId;
        data.beginAt = beginAt;
        data.endAt = endAt;
        data.reason = reason;
        await data.save();
        res.send(new BaseResponse({ data, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteAbsence = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const data = await Absence.findByPk(id);
        if (!data) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no absence with this id", lang }));
        const isSuccess = !(!(await data.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addAbsence, getStudentAbsences, updateAbsence, deleteAbsence };
