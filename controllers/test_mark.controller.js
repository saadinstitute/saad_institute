const BaseResponse = require('../models/base_response');
const Test = require('../models/test');
const TestMark = require('../models/test_name');
const { validateAdmin, validateUser, validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");

const addMark = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { mark, isPrimary, testId } = req.body;
        await validateUser(req);
        const test = await Test.findByPk(testId);
        if (!test) return res.send(new BaseResponse({ status:404 , msg: "there is no test with this id", lang }));
        const testMark = await TestMark.create({ mark, testId, isPrimary });
        res.send(new BaseResponse({ data: test, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const getTestMarks = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { testId } = req.query;
        const query = { testId };
        const data = await TestName.findAndCountAll({ where: query });
        const marks = data.rows;
        // const testsCharitiesCount = data.count;
        res.send(new BaseResponse({ data: marks, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang }));
    }
};

const updateTestMark = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateUser(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const testMark = await TestName.findByPk(data.id);
        const { mark, isPrimary } = data;
        testMark.mark = mark;
        testMark.isPrimary = isPrimary;
        await testMark.save();
        res.send(new BaseResponse({ data: test, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteTestMark = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateUser(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const mark = await TestMark.findByPk(id);
        if (!mark) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no mark with the id", lang }));
        const isSuccess = !(!(await mark.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addMark, getTestMarks, updateTestMark, deleteTestMark };
