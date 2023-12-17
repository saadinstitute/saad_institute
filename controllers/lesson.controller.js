const BaseResponse = require('../models/base_response');
const Lesson = require('../models/lesson');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addLesson = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        const lesson = await Lesson.create(req.body);
        res.send(new BaseResponse({ data: lesson, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getStudentLessons = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0,  studentId } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        const query = { studentId };
        const data = await Lesson.findAndCountAll({
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

const updateLesson = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateUser(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const lesson = await Lesson.findByPk(data.id);
        const { studentId, mark, page, quantity, note } = data;
        lesson.studentId = studentId;
        lesson.mark = mark;
        lesson.page = page;
        lesson.quantity = quantity;
        lesson.note = note;
        await lesson.save();
        res.send(new BaseResponse({ data: lesson, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteLesson = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const lesson = await Lesson.findByPk(id);
        if (!lesson) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no lesson with this id", lang }));
        const isSuccess = !(!(await lesson.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addLesson, getStudentLessons, updateLesson, deleteLesson };
