const BaseResponse = require('../models/base_response');
const Category = require('../models/category');
const cloudinary = require('cloudinary').v2;
const formidable = require('formidable');
const { validateSuperAdmin } = require("../others/validator");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const addCategory = async (req, res) => {
    try {

        const data = await getFileFromReq(req);
        const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
        console.log(resCloudinary);
        const msg = await validateSuperAdmin(req.headers['authorization']);
        if (msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg }));
        const { arName, enName } = data;
        const category = await Category.create({ imageUrl: resCloudinary.url, arName, enName });
        res.send(new BaseResponse({ data: category, success: true, msg: "success" }));
    } catch (error) {
        // console.log(error);
        res.send(new BaseResponse({ success: false, msg: error.message }));
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


module.exports = { addCategory };
