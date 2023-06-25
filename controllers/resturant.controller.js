const BaseResponse = require('../models/base_response');
const Resturant = require('../models/resturant');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateAdmin, validateUser } = require("../others/validator");
const { Op } = require("sequelize");
const Donate = require('../models/donate');

const donate = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { resturantId, charityId, quantity } = req.body;
        const user = await validateAdmin(req);
        const resturant = await Resturant.findByPk(resturantId);
        if(resturant.userId !== user.id) return res.send(new BaseResponse({status: 400, msg: "you can't donate for this resturant", lang }));
        const donate = await Donate.create({ quantity, resturantId, charityId, donateBy: user.id });
        res.send(new BaseResponse({ data: donate, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const addResturant = async (req, res) => {
    const lang = req.headers["lang"];
    try {

        const data = await getFormFromReq(req);
        const { arName, enName, enAddress, arAddress, openAt, closeAt, mobile } = data;
        let { userId } = data;
        const user = await validateAdmin(req);
        if (user.role !== "superAdmin" && !userId) return res.send(new BaseResponse({ success: false, msg: "userId field is required", lang }));
        const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
        if (user.role == "admin") userId = user.id;
        const resturant = await Resturant.create({ imageUrl: resCloudinary.url, arName, enName, arAddress, enAddress, openAt, closeAt, mobile, userId });
        res.send(new BaseResponse({ data: resturant, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getResturants = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateUser(req);
        const { pageSize = 10, page = 0, search } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let userId = user.role == "admin" ? user.id : null;
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
        if (userId)
            query.userId = userId;
        const data = await Resturant.findAndCountAll({ where: query, offset: start * size, limit: size });
        let resturants = data.rows;
        let resturantsCount = data.count;
        res.send(new BaseResponse({ data: resturants, success: true, msg: "success", lang, pagination: { total: resturantsCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateResturant = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFormFromReq(req);
        const user = await validateAdmin(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const resturant = await Resturant.findOne({ where: { id: data.id } });
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            resturant.imageUrl = resCloudinary.url ?? resturant.imageUrl;
        }
        if (user.role !== "superAdmin" && resturant.userId !== user.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't edit this resturant", lang }));
        const { arName, enName, enAddress, arAddress, openAt, closeAt, mobile } = data;
        if (arName && arName !== "") resturant.arName = arName;
        if (enName && enName !== "") resturant.enName = enName;
        if (enAddress && enAddress !== "") resturant.enAddress = enAddress;
        if (arAddress && arAddress !== "") resturant.arAddress = arAddress;
        if (openAt && openAt !== "") resturant.openAt = openAt;
        if (closeAt && closeAt !== "") resturant.closeAt = closeAt;
        if (mobile && mobile !== "") resturant.mobile = mobile;
        await resturant.save();
        res.send(new BaseResponse({ data: resturant, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteResturant = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const user = await validateAdmin(req);
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const resturant = await Resturant.findOne({ where: { id } });
        if (!resturant) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no resturant with the id", lang }));
        if (user.role !== "superAdmin" && resturant.userId !== user.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't delete this resturant", lang }));
        const isSuccess = !(!(await resturant.destroy()));
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


module.exports = { addResturant, getResturants, updateResturant, deleteResturant, donate };
