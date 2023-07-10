const BaseResponse = require('../models/base_response');
const Course = require('../models/course');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addCourse = async (req, res) => {
    const lang = req.headers["lang"];
    try {

        const data = await getFormFromReq(req);
        const { arName, enName, enDescription, arDescription, price} = data;
        await validateSuperAdmin(req);
        const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
        const course = await Course.create({ imageUrl: resCloudinary.url, arName, enName, enDescription, arDescription, price });
        res.send(new BaseResponse({ data: course, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getCourses = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateSuperAdmin(req);
        const { pageSize = 10, page = 0, search } = req.query;
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
        const data = await Course.findAndCountAll({ where: query, offset: start * size, limit: size });
        let courses = data.rows;
        let coursesCount = data.count;
        res.send(new BaseResponse({ data: courses, success: true, msg: "success", lang, pagination: { total: coursesCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateCourse = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        await validateSuperAdmin(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const course = await Course.findByPk(data.id);
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            course.imageUrl = resCloudinary.url ?? course.imageUrl;
        }
        const { arName, enName, enDescription, arDescription, price } = data;
        if (arName && arName !== "") course.arName = arName;
        if (enName && enName !== "") course.enName = enName;
        if (enDescription && enDescription !== "") course.enDescription = enDescription;
        if (arDescription && arDescription !== "") course.arDescription = arDescription;
        if (price && price !== "") course.price = price;
        await course.save();
        res.send(new BaseResponse({ data: course, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteCourse = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateSuperAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const course = await Course.findByPk(id);
        if (!course) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no course with the id", lang }));
        const isSuccess = !(!(await course.destroy()));
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


module.exports = { addCourse, getCourses, updateCourse, deleteCourse };
