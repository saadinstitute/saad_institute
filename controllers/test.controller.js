const BaseResponse = require('../models/base_response');
const Student = require('../models/student');
const Test = require('../models/test');
const TestMark = require('../models/test_mark');
const TestName = require('../models/test_name');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op, Association } = require("sequelize");

const addTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        let { studentId, teacherId, testerId, testNameId } = req.body;
        const user = await validateUser(req);
        if (user.role === "teacher") {
            teacherId = user.id;
        } else if (user.role === "tester") {
            testerId = user.id;
        }
        const test = await Test.create({ teacherId, testerId, studentId, testNameId });
        res.send(new BaseResponse({ data: test, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getTests = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search, studentId } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if (user.role === "tester") {
            query.testerId = user.id;
        }
        if (studentId) {
            query.studentId = studentId;
        }
        const justPendingTests = user.role === "tester";
        // console.log("-----------------------------");
        // console.log(query.testerId);
        // console.log(justPendingTests);
        // console.log("-----------------------------");
        const data = await Test.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
            order: [
                ['createdAt', 'ASC'],
            ],
            include: [
                TestName,
                Student,
                {
                    model: TestMark,
                    required: false,
                    as: "marks",
                    where: justPendingTests?{
                        "id": null
                    }:{}
                },
            ],
            subQuery: false,
            distinct: true,
            attributes: {
                exclude: ["studentId", "testNameId"]
            }
        });
        const tests = data.rows;
        const testsCount = data.count;
        res.send(new BaseResponse({ data: tests, success: true, msg: "success", lang, pagination: { total: testsCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const updateTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateUser(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const test = await Test.findByPk(data.id);
        let { studentId, teacherId, testerId,  testNameId, marks } = req.body;
        test.studentId = studentId;
        test.teacherId = teacherId;
        test.teacherId = testerId;
        test.testNameId = testNameId;
        for (let index = 0; index < marks.length; index++) {
            let mark = marks[index];
            mark.testId = test.id;
        }
        if (marks.length > 0) {
            await TestMark.bulkCreate(marks);
        }
        await test.save();
        res.send(new BaseResponse({ data: test, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const test = await Test.findByPk(id);
        if (!test) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no test with this id", lang }));
        const isSuccess = !(!(await test.destroy()));
        res.send(new BaseResponse({ success: isSuccess, msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const resetTest = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const test = await Test.findByPk(id);
        const { teacherId, testerId, studentId, type, testNameId } = test;
        if (!test) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no test with this id", lang }));
        let isSuccess = !(!(await test.destroy()));
        if (isSuccess) {
            const newTest = await Test.create({ teacherId, testerId, studentId, type, testNameId });
            isSuccess = !(!newTest.id);
        }
        res.send(new BaseResponse({ success: isSuccess, msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addTest, getTests, updateTest, deleteTest, resetTest };
