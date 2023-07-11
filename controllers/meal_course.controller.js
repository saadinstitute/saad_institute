const BaseResponse = require('../models/base_response');
const CourseMeal = require('../models/course_meal');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateAdmin, validateSuperAdmin} = require("../others/validator");
const { Op } = require("sequelize");


const addMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const { arName, enName  } = data;
        await validateSuperAdmin(req);
        let imageUrl;
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            imageUrl = resCloudinary.url;
        }
        const meal = await CourseMeal.create({ imageUrl, arName, enName });
        res.send(new BaseResponse({ data: meal, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getMeals = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search} = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if (search) {
            query[Op.or] = [
                {
                    arName: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    enName: {
                        [Op.like]: `%${search}%`
                    }
                }
            ];
        }
        const data = await CourseMeal.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size
        });

        const meals = data.rows;
        const mealsCount = data.count;
        res.send(new BaseResponse({ data: meals, success: true, msg: "success", lang, pagination: { total: mealsCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const { arName, enName, id } = data;
        await validateSuperAdmin(req);
        const meal = await CourseMeal.findByPk(id);
        if (!meal) {
            return res.send(new BaseResponse({ success: false, msg: "meal not fount", status: 400, lang }));
        }
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            meal.imageUrl = resCloudinary.url;
        }
        if (arName && arName !== "") meal.arName = arName;
        if (enName && enName !== "") meal.enName = enName;
        await meal.save();
        res.send(new BaseResponse({ data: meal, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateSuperAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const meal = await CourseMeal.findByPk(id);
        if (!meal) return res.send(new BaseResponse({ success: false, status: 404, msg: "meal not found", lang }));
        const isSuccess = !(!(await meal.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


function getFormFromReq(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ ...fields, ...files });
        });
    });
}


module.exports = { addMeal, getMeals, updateMeal, deleteMeal };
