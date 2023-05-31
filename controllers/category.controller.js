const BaseResponse = require('../models/base_response');
const Category = require('../models/category');
const formidable = require('formidable');
const { validateSuperAdmin } = require("../others/validator");

const addCategory = async (req, res) => {
    try {

        const data = await getFileFromReq(req);
        console.log(data);
        return res.send("test");
        const msg = await validateSuperAdmin(req.headers['authorization']);
        if(msg) return res.send(new BaseResponse({success: false, status: 403, msg: msg}));
        const { arName, enName } = req.body;
        const category = await Category.create({imageUrl: req.file.location, arName, enName});
        res.send(new BaseResponse({data: category,success: true, msg: "success"}));
    } catch (error) {
        // console.log(error);
        res.send(new BaseResponse({success: false, msg: error.message}));
    }
};


function getFileFromReq(req){
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (error, fields, files) => {
            if(error){
                reject(error);
                return;
            }
            resolve({...fields, ...files});
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


module.exports = { addCategory};
