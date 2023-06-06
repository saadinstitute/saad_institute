const BaseResponse = require('../models/base_response');
const Charity = require('../models/charity');
const { validateAdmin, validateUser, validateSuperAdmin  } = require("../others/validator");

const addCharity = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { arName, enName, enAddress, arAddress, mobile } = req.body;
        const msg = await validateSuperAdmin(req);
        if(msg) return res.send(new BaseResponse({ success: false, msg: msg, lang, status: 403 }));
        const charity = await Charity.create({arName, enName, arAddress, enAddress, mobile});
        res.send(new BaseResponse({ data: charity, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};

const getCharities = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0} = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let Charities;
        let CharitiesCount;
        Charities = await Charity.findAll({offset: start * size, limit: size});
        CharitiesCount = await Charity.count();
        res.send(new BaseResponse({ data: Charities, success: true, msg: "success", lang, pagination: {total: CharitiesCount, page: start, pageSize: size} }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang: lang}));
    }
};

const updateCharity = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = req.body;
        const msg = await validateSuperAdmin(req);
        if(msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang}));
        if(!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const charity = await Charity.findOne({ where:{id: data.id}});
        const {arName, enName, enAddress, arAddress, mobile} = data;
        if(arName && arName !== "") charity.arName = arName;
        if(enName && enName !== "") charity.enName = enName;
        if(enAddress && enAddress !== "") charity.enAddress = enAddress;
        if(arAddress && arAddress !== "") charity.arAddress = arAddress;
        if(mobile && mobile !== "") charity.mobile = mobile;
        await charity.save();
        res.send(new BaseResponse({ data: charity, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteCharity = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const msg = await validateSuperAdmin(req);
        if(msg) return res.send(new BaseResponse({ success: false, status: 403, msg, lang }));
        if(!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const charity = await Charity.findOne({ where:{ id }});
        if(!charity) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no charity with the id", lang }));
        const isSuccess = !(!(await charity.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess?"deleted successfully":"there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


module.exports = { addCharity, getCharities, updateCharity, deleteCharity };
