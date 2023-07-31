const BaseResponse = require('../models/base_response');
const Charity = require('../models/charity');
const Delivery = require('../models/delivery');
const { validateAdmin, validateUser, validateSuperAdmin  } = require("../others/validator");
const { Op } = require("sequelize");

const addDelivery = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { arName, enName,  mobile } = req.body;
        const msg = await validateSuperAdmin(req);
        if(msg) return res.send(new BaseResponse({ success: false, msg: msg, lang, status: 403 }));
        const delivery = await Delivery.create({arName, enName, mobile});
        res.send(new BaseResponse({ data: delivery, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};

const getDeliveries = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0, search} = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if(search);
        query = {[Op.or]:[
            {
                arName:{
                    [Op.like]: `%${search}%`
                }
            },
            {
                enName:{
                    [Op.like]: `%${search}%`
                }
            }
        ]};
        const data = await Delivery.findAndCountAll({ where: query, offset: start * size, limit: size});
        const deliveries = data.rows;
        const deliveriesCount = data.count;
        res.send(new BaseResponse({ data: deliveries, success: true, msg: "success", lang, pagination: {total: deliveriesCount, page: start, pageSize: size} }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};

const updateDelivery = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        const msg = await validateSuperAdmin(req);
        if(msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang}));
        if(!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const delivery = await Delivery.findByPk(data.id);
        const {arName, enName, mobile} = data;
        if(arName && arName !== "") delivery.arName = arName;
        if(enName && enName !== "") delivery.enName = enName;
        if(mobile && mobile !== "") delivery.mobile = mobile;
        await delivery.save();
        res.send(new BaseResponse({ data: delivery, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteDelivery = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const msg = await validateSuperAdmin(req);
        if(msg) return res.send(new BaseResponse({ success: false, status: 403, msg, lang }));
        if(!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const delivery = await Delivery.findByPk(id);
        if(!delivery) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no delivery company with the id", lang }));
        const isSuccess = !(!(await delivery.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess?"deleted successfully":"there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addDelivery, getDeliveries, updateDelivery, deleteDelivery };
