const BaseResponse = require('../models/base_response');
const Category = require('../models/category');
const { validateSuperAdmin } = require("../others/validator");

const addCategory = async (req, res) => {
    try {
        const msg = await validateSuperAdmin(req.headers['authorization']);
        if(msg) return res.send(new BaseResponse({success: false, status: 403, msg: msg}));
        const { arName, enName } = req.body;
        let image;
        if(req.files){
            image = req.files[0];
            console.log(image);
        }
        await Category.create();
        res.send(new BaseResponse({data: {},success: true, msg: "success"}));
    } catch (error) {
        // console.log(error);
        res.send(new BaseResponse({success: false, msg: error.message}));
    }
};



module.exports = { addCategory};
