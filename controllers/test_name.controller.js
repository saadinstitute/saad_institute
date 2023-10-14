const BaseResponse = require('../models/base_response');
const TestName = require('../models/test_name');
const { validateAdmin, validateUser, validateSuperAdmin  } = require("../others/validator");
const { Op } = require("sequelize");

const addTestName = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { name, type } = req.body;
        await validateAdmin(req);
        const test = await TestName.create({ name, type });
        res.send(new BaseResponse({ data: test, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};

const getTestNames = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const {search, type} = req.query;
        let query = {};
        if(search)
        query = {[Op.or]:[
            {
                name:{
                    [Op.like]: `%${search}%`
                }
            }
        ]};
        if(type){
            query.type = type;
        }
        const data = await TestName.findAndCountAll({ where: query });
        const tests = data.rows;
        // const testsCharitiesCount = data.count;
        res.send(new BaseResponse({ data: tests, success: true, msg: "success", lang}));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};

const updateTestName = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        await validateAdmin(req);
        if(!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const test = await TestName.findByPk(data.id);
        const {name, type} = data;
        test.name = name;
        test.type = type;
        await test.save();
        res.send(new BaseResponse({ data: test, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteTestName = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateAdmin(req);
        if(!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const test = await TestName.findByPk(id);
        if(!test) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no charity with the id", lang }));
        const isSuccess = !(!(await test.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess?"deleted successfully":"there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addTestName, getTestNames, updateTestName, deleteTestName };
