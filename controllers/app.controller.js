const BaseResponse = require('../models/base_response');

const checkServer = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        res.send(new BaseResponse({data: {},success: true, msg: "success",lang}));
    } catch (error) {
        res.send(new BaseResponse({success: false, msg: error, lang}));
    }
};


module.exports = { checkServer};
