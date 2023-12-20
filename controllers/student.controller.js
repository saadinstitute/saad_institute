const BaseResponse = require('../models/base_response');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateAdmin, validateUser } = require("../others/validator");
const { Op, Sequelize } = require("sequelize");
const Student = require('../models/student');
const Klass = require('../models/klass');
const Absence = require('../models/absence');
const Category = require('../models/category');

const addStudent = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const { firstName, lastName, dateOfBirth, joinedAt, placeOfBirth, fatherName, fatherWork, fatherEducation, motherName, motherEducation, sisters, brothers, previousInstitute, previousAchievement, image, fatherPhone, whatsappNumber, phoneNumber, landlineNumber, specialHealth, skill, school, schoolCohort, currentAddress, klassId, categoryId } = data;
        await validateAdmin(req);
        let imageUrl;
        if (image) {
            const resCloudinary = await cloudinary.uploader.upload(image.filepath);
            imageUrl = resCloudinary.url;
        }
        const student = await Student.create({ imageUrl, firstName, lastName, joinedAt, dateOfBirth, placeOfBirth, fatherName, fatherWork, fatherEducation, motherName, motherEducation, sisters: Number(sisters), brothers: Number(brothers), previousInstitute, previousAchievement, fatherPhone, whatsappNumber, phoneNumber, landlineNumber, specialHealth, skill, school, schoolCohort, currentAddress, klassId, categoryId });
        res.send(new BaseResponse({ data: student, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getStudents = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search, klassId } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if (search) {
            query[Op.or] = [
                {
                    [Op.and]: Sequelize.where(
                        Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')),
                        { [Op.like]: `%${search}%` }
                    )
                }
            ];

        }
        if (klassId) {
            console.log("klassId:");
            console.log(klassId);
            query.klassId = klassId;
        }
        if (user.role === "teacher") {
            const klasses = await Klass.findAll({
                where: {
                    teacherId: user.id
                }
            });
            const klassesId = klasses.map(klass => klass.id);
            query.klassId = { [Op.in]: klassesId };
        }
        if (klassId && user.role !== "teacher") {
            query.klassId = klassId;
        }
        const data = await Student.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
            include: [
                {
                    model: Klass,
                    as: "klass",
                    paranoid: false
                },
                {
                    model: Category,
                    as: "category",
                    paranoid: false
                },
                {
                    model: Absence,
                    required: false,
                    separate: true,
                    order: [
                        ["beginAt", "DESC"]
                    ],
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    paranoid: false
                }],
            // attributes: { exclude: ["klassId"] },
        });

        const students = data.rows;
        const studentsCount = data.count;
        res.send(new BaseResponse({ data: students, success: true, msg: "success", lang, pagination: { total: studentsCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateStudent = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const { id, firstName, lastName, dateOfBirth, placeOfBirth, fatherName, fatherWork, fatherEducation,
            motherName, motherEducation, sisters, brothers, previousInstitute, joinedAt, previousAchievement, image, fatherPhone, whatsappNumber,
            phoneNumber, landlineNumber, specialHealth, skill, school, schoolCohort, currentAddress, klassId, categoryId } = data;
        await validateAdmin(req);
        const studnet = await Student.findByPk(id);
        if (!studnet) {
            return res.send(new BaseResponse({ success: false, msg: "student not fount", status: 400, lang }));
        }
        if (image) {
            const resCloudinary = await cloudinary.uploader.upload(image.filepath);
            studnet.imageUrl = resCloudinary.url;
        }
        studnet.firstName = firstName;
        studnet.lastName = lastName;
        studnet.dateOfBirth = dateOfBirth;
        studnet.joinedAt = joinedAt;
        studnet.placeOfBirth = placeOfBirth;
        studnet.fatherName = fatherName;
        studnet.fatherWork = fatherWork;
        studnet.fatherEducation = fatherEducation;
        studnet.motherName = motherName;
        studnet.motherEducation = motherEducation;
        studnet.sisters = Number(sisters);
        studnet.brothers = Number(brothers);
        studnet.previousInstitute = previousInstitute;
        studnet.previousAchievement = previousAchievement;
        studnet.fatherPhone = fatherPhone;
        studnet.whatsappNumber = whatsappNumber;
        studnet.phoneNumber = phoneNumber;
        studnet.landlineNumber = landlineNumber;
        studnet.specialHealth = specialHealth;
        studnet.skill = skill;
        studnet.school = school;
        studnet.schoolCohort = schoolCohort;
        studnet.currentAddress = currentAddress;
        studnet.klassId = klassId;
        studnet.categoryId = categoryId;
        await studnet.save();
        res.send(new BaseResponse({ data: studnet, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteStudent = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const student = await Student.findByPk(id);
        if (!student) return res.send(new BaseResponse({ success: false, status: 404, msg: "student not found", lang }));
        const isSuccess = !(!(await student.destroy()));
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


module.exports = { addStudent, getStudents, updateStudent, deleteStudent };
