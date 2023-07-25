const BaseResponse = require('../models/base_response');
const Course = require('../models/course');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");
const MealsInCourses = require('../models/meals_in_courses');
const CourseMeal = require('../models/course_meal');
const sequelize = require("../database/db");
const CourseUser = require('../models/course_user');

const subscribeCourse = async (req, res) => {
    const lang = req.headers["lang"];
    try {

        const data = req.body;
        const { courseId, beginAt, endAt, receiveAt } = data;
        const user = await validateUser(req);
        if (user.role != "user")
            return res.send(new BaseResponse({ status: 403, msg: "you cann't subscribe to this course", lang }));
        const oldSub = await CourseUser.findOne({
            where: {
                courseId: courseId,
                userId: user.id
            }
        });
        if (oldSub)
            return res.send(new BaseResponse({ status: 400, msg: "you cann't subscribe to the same course twice", lang }));
        const subscribtion = await CourseUser.create({ courseId, beginAt: Date.parse(beginAt), endAt: Date.parse(endAt), receiveAt: Date.parse(receiveAt), userId: user.id });
        res.send(new BaseResponse({ data: subscribtion, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const unsubscribeCourse = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        const { courseId } = data;
        const user = await validateUser(req);
        const subscribtion = await CourseUser.findOne({
            where: {
                courseId: courseId,
                userId: user.id
            }
        });
        if(!subscribtion)
            return res.send(new BaseResponse({ status: 400, msg: "you are not subscribed to this course", lang })); 
        const isSuccess = !(!(await subscribtion.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "unsubscribed successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const addCourse = async (req, res) => {
    const lang = req.headers["lang"];
    try {

        const data = await getFormFromReq(req);
        const { arName, enName, enDescription, arDescription, price } = data;
        await validateSuperAdmin(req);
        const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
        const course = await Course.create({ imageUrl: resCloudinary.url, arName, enName, enDescription, arDescription, price });
        res.send(new BaseResponse({ data: course, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const addCourseInMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { courseId, mealId, calories } = req.body;
        await validateSuperAdmin(req);
        const row = await MealsInCourses.create({ courseId, mealId, calories });
        res.send(new BaseResponse({ data: row, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteCourseFromMeal = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { courseId, mealId } = req.body;
        await validateSuperAdmin(req);
        const row = await MealsInCourses.findOne({ where: { courseId, mealId } });
        const isSuccess = !(!(await row.destroy()));
        res.send(new BaseResponse({ success: isSuccess, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getCourses = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search, isSubscribed } = req.query;
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
        const data = await Course.findAndCountAll({ where: query, offset: start * size, limit: size,
            include: {
                model: CourseUser,
                where: {
                    userId: user.id
                },
                required: isSubscribed === 'true',
                as: "course_users",
            } });
        let courses = data.rows;
        let coursesCount = data.count;
        let edited = [];
        for (let index = 0; index < courses.length; index++) {
            edited[index] = JSON.parse(JSON.stringify(courses[index].dataValues));
            edited[index].subscription = null;
            if(edited[index].course_users.length > 0){
                edited[index].subscription = edited[index].course_users[0];
            }
            edited[index].course_users = undefined;
        }
        res.send(new BaseResponse({ data: edited, success: true, msg: "success", lang, pagination: { total: coursesCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getMeals = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        if (!req.params.courseId)
            return res.send(new BaseResponse({ success: false, status: 400, msg: "course id param is required", lang }));
        let courseId = req.params.courseId;
        const meals = await sequelize.query(`SELECT cm.*, cim.calories as calories FROM course_meal as cm, meals_in_courses as cim
         where cim.courseId = '${courseId}' and cim.mealId = cm.id`, {
            model: CourseMeal,
            // mapToModel: true
        });
        res.send(new BaseResponse({ data: meals, success: true, msg: "success", lang }));
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


module.exports = { addCourse, getCourses, updateCourse, deleteCourse, addCourseInMeal, deleteCourseFromMeal, getMeals, subscribeCourse, unsubscribeCourse };
