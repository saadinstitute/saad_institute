const BaseResponse = require('../models/base_response');
const Resturant = require('../models/resturant');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateAdmin, validateUser  } = require("../others/validator");

const addResturant = async (req, res) => {
    try {
        const lang = req.headers["lang"];
        const data = await getFormFromReq(req);
        const { arName, enName, enAddress, arAddress, openAt, closeAt, mobile } = data;
        let {userId} = data;
        const user = await validateAdmin(req);
        if(user.role !== "superAdmin" && !userId) return res.send(new BaseResponse({ success: false, msg: "userId field is required", lang }));
        const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
        if (user.role == "admin") userId = user.id;
        const category = await Resturant.create({ imageUrl: resCloudinary.url, arName, enName, arAddress, enAddress, openAt, closeAt, mobile, userId});
        res.send(new BaseResponse({ data: category, success: true, msg: "success", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error.message ?? error}));
    }
};

const getResturants = async (req, res) => {
    try {
        const lang = req.headers["lang"];
        const user = await validateUser(req);
        const { pageSize = 10, page = 0} = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let resturants;
        let resturantsCount;
        if(user.role == "admin"){
            resturants = await Resturant.findAll({where: {userId: user.id}, offset: start * size, limit: size});
            resturantsCount = await Resturant.count({where: {userId: user.id}});
        } else {
            resturants = await Resturant.findAll({offset: start * size, limit: size});
            resturantsCount = await Resturant.count();
        }
        res.send(new BaseResponse({ data: resturants, success: true, msg: "success", lang, pagination: {total: resturantsCount, page: start, pageSize: size} }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error.message ?? error , pagination: {}}));
    }
};

const updateResturant = async (req, res) => {
    try {
        const lang = req.headers["lang"];
        const data = await getFormFromReq(req);
        const user = await validateAdmin(req);
        if(!data.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id field is required", lang }));
        const resturant = await Resturant.findOne({ where:{id: data.id}});
        if(data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            resturant.imageUrl = resCloudinary.url ?? resturant.imageUrl;
        }
        if(user.role !== "superAdmin" && resturant.userId !== user.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't edit this resturant", lang }));
        const {arName, enName, enAddress, arAddress, openAt, closeAt, mobile} = data;
        resturant.arName = arName ?? resturant.arName;
        resturant.enName = enName ?? resturant.enName;
        resturant.enAddress = enAddress ?? resturant.enAddress;
        resturant.arAddress = arAddress ?? resturant.arAddress;
        resturant.openAt = openAt ?? resturant.openAt;
        resturant.closeAt = closeAt ?? resturant.closeAt;
        resturant.mobile = mobile ?? resturant.mobile;
        await resturant.save();
        res.send(new BaseResponse({ data: resturant, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error.message ?? error }));
    }
};

const deleteResturant = async (req, res) => {
    try {
        const lang = req.headers["lang"];
        const user = await validateAdmin(req);
        if(!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const resturant = await Resturant.findOne({ where:{ id }});
        if(!resturant) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no resturant with the id", lang }));
        if(user.role !== "superAdmin" && resturant.userId !== user.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't delete this resturant", lang }));
        const isSuccess = !(!(await resturant.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess?"deleted successfully":"there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: `${typeof error}: ${error.message ?? error}` }));
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


module.exports = { addResturant, getResturants, updateResturant, deleteResturant };
