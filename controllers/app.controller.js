const BaseResponse = require('../models/base_response');

const checkServer = async (req, res) => {
    try {
        res.send(new BaseResponse({data: {},success: true, msg: "success"}));
    } catch (error) {
        res.send(new BaseResponse({success: false, msg: error}));
    }
};


const upload = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.files);
        res.send(new BaseResponse({data: {},success: true, msg: "success"}));
    } catch (error) {
        res.send(new BaseResponse({success: false, msg: error}));
    }
};



module.exports = { checkServer , upload};
