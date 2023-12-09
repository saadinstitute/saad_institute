const BaseResponse = require('../models/base_response');
const Attendance = require('../models/attendance');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addAttencance = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        const attendance = await Attendance.create(req.body);
        res.send(new BaseResponse({ data: attendance, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getStudentAttendance = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0, isPresent, studentId, startDate, end } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        const query = { studentId };
        if (isPresent) {
            query.isPresent = isPresent;
        }
        if(start && end){
            query.date = {
            [Op.between]: [Date(startDate), Date(endDate)]
        }
        }
        const data = await Attendance.findAndCountAll({
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

const updateAttendance = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateUser(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const attendance = await Attendance.findByPk(data.id);
        const { studentId, isPresent, date } = data;
        attendance.studentId = studentId;
        attendance.date = date;
        attendance.isPresent = Boolean(isPresent);
        await attendance.save();
        res.send(new BaseResponse({ data: test, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteAttendance = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const attencance = await Attendance.findByPk(id);
        if (!attencance) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no attencance with the id", lang }));
        const isSuccess = !(!(await attencance.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addAttencance, getStudentAttendance, updateAttendance, deleteAttendance };
