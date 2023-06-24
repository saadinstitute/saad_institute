const BaseResponse = require('../models/base_response');
const Category = require('../models/category');
const cloudinary = require('../others/cloudinary.config');
const formidable = require('formidable');
const { validateSuperAdmin } = require("../others/validator");
const { Op } = require("sequelize");
const sequelize = require("../database/db");

const addCategory = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const data = await getFileFromReq(req);
        const msg = await validateSuperAdmin(req);
        if (msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang }));
        const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
        const { arName, enName } = data;
        const category = await Category.create({ imageUrl: resCloudinary.url, arName, enName });
        res.send(new BaseResponse({ data: category, success: true, msg: "success" }));
    } catch (error) {
        // console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getCategories = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize, page, search } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if(search)
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
        const data = await Category.findAndCountAll({where: query, offset: start * size, limit: size });
        const categories = data.rows;
        const categoriesCount = data.count;
        res.send(new BaseResponse({ data: categories, success: true, msg: "success", lang, pagination: { total: categoriesCount, page: start, pageSize: size } }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const getResturantCategories = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        if (!req.params.resturantId)
            return res.send(new BaseResponse({ success: false, status: 400, msg: "resturant id param is required", lang }));
        let resId = req.params.resturantId;
        const categories = await sequelize.query(`SELECT ca.* FROM category as ca, meal as m where m.resturantId = '${resId}' and m.categoryId = ca.id`, {
            model: Category,
            mapToModel: true
          });
        res.send(new BaseResponse({ data: categories, success: true, msg: "success", lang}));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const updateCategory = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const msg = await validateSuperAdmin(req);
        if (msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang }));
        const data = await getFileFromReq(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "id field is required", lang }));
        const category = await Category.findOne({ where: { id: data.id } });
        if (!category) return res.send(new BaseResponse({ success: false, status: 404, msg: "there is no category with the id", lang }));
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            category.imageUrl = resCloudinary.url ?? category.imageUrl;
        }
        const { arName, enName } = data;
        if(arName && arName !== "") category.arName = arName;
        if(enName && enName !== "") category.enName = enName;
        await category.save();
        res.send(new BaseResponse({ data: category, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteCategory = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const msg = await validateSuperAdmin(req);
        if (msg)
            return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang }));
        if (!req.params.id)
            return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const category = await Category.findOne({ where: { id } });
        if (!category)
            return res.send(new BaseResponse({ success: false, status: 404, msg: `there is no category with the id`, lang }));
        const isSuccess = !(!(await category.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};


function getFileFromReq(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ ...fields, ...files });
        });
        // const chunks = [];
        // req.on('data',(data)=>{
        //     chunks.push(data);
        // });
        // req.on('error', reject);
        // req.on('end', () => {
        //     resolve(Buffer.concat(chunks).toString());
        // });
    });
}


module.exports = { addCategory, getCategories, getResturantCategories, updateCategory, deleteCategory };
