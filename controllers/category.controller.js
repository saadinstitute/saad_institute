const BaseResponse = require('../models/base_response');
const DayTime = require('../models/day_time');
const Category = require('../models/category');
const Student = require('../models/student');
const { validateAdmin, validateUser } = require("../others/validator");
const { Op, Sequelize } = require("sequelize");
const db = require("../database/db");

const addCategory = async (req, res) => {
    const lang = req.headers["lang"];
    try {

        const data = req.body;
        const { name } = data;
        await validateAdmin(req);
        const category = await Category.create({ name });
        res.send(new BaseResponse({ data: category, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getCategories = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        if ((user.role === "teacher" || user.role === "tester")) {
            return res.status(403).send(new BaseResponse({ status: 403, msg: "لايوجد لديك صلاحية" }));
        }
        let query = {};
        if (search) {
            query[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                }
            ];
        }

        const data = await Category.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
            include: [
                {
                    model: Student,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [Sequelize.fn("COUNT", Sequelize.col("students.id")), "studentsCount"]
                ]
            },
            group: ['id'],
            subQuery: false
        });
        let rows = data.rows;
        let count = rows.length === 0 ? 0 : data.count[0].count;
        res.send(new BaseResponse({ data: rows, success: true, msg: "success", lang, pagination: { total: count, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


const updateCategory = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateAdmin(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const value = await Category.findOne({ where: { id: data.id } });
        const { name } = data;
        value.name = name;
        await value.save();
        res.send(new BaseResponse({ data: value, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteCategory = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const value = await Category.findByPk(id);
        if (!value) return res.send(new BaseResponse({ success: false, status: 404, msg: "الفئة غير موجودة", lang }));
        const isSuccess = !(!(await value.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};



module.exports = { addCategory, getCategories, updateCategory, deleteCategory };
