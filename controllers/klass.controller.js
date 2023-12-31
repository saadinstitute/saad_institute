const BaseResponse = require('../models/base_response');
const DayTime = require('../models/day_time');
const Klass = require('../models/klass');
const User = require('../models/user');
const Student = require('../models/student');
const { validateAdmin, validateUser } = require("../others/validator");
const { Op, Sequelize } = require("sequelize");
const db = require("../database/db");

const addKlass = async (req, res) => {
    const lang = req.headers["lang"];
    try {

        const data = req.body;
        await validateAdmin(req);
        const klass = await Klass.create(data);
        res.send(new BaseResponse({ data: klass, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getKlasses = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let userId = (user.role == "admin" || user.role == "superAdmin") ? null : user.id;
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
        if (userId)
            query.userId = userId;
        // await db.query("SET GLOBAL sql_mode = ''");
        const data = await Klass.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
            include: [
                {
                    model: DayTime,
                    paranoid: false
                },
                {
                    model: User,
                    as: "teacher",
                    paranoid: false
                },
                {
                    model: Student,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [Sequelize.fn("COUNT", Sequelize.col("students.id")), "studentsCount"]
                ],
                exclude: ["dayTimeId", "teacherId"]
            },
            group: ['id'],
            subQuery: false
        });
        let klasses = data.rows;
        let klassesCount = klasses.length === 0 ? 0 : data.count[0].count;
        // console.log(data.count);
        res.send(new BaseResponse({ data: klasses, success: true, msg: "success", lang, pagination: { total: klassesCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


const updateKlass = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateAdmin(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const klass = await Klass.findOne({ where: { id: data.id } });
        const { name, userId, dayTimeId } = data;
        klass.name = name;
        klass.userId = userId;
        klass.dayTimeId = dayTimeId;
        await klass.save();
        res.send(new BaseResponse({ data: klass, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteKlass = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const klass = await Klass.findByPk(id);
        if (!klass) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no resturant with the id", lang }));
        const isSuccess = !(!(await klass.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};



module.exports = { addKlass, getKlasses, updateKlass, deleteKlass };
