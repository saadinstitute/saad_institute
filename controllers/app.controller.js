const BaseResponse = require('../models/base_response');
require('dotenv').config();


const checkServer = async (req, res) => {
    try {
        res.send(new BaseResponse({data: {},success: true, msg: "success"}));
    } catch (error) {
        res.send(new BaseResponse({success: false, msg: error}));
    }
};



module.exports = { checkServer };
