const { request, response } = require('express');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const BaseResponse = require('../models/base_response');
const User = require('../models/user');

router.use(function (req = request, res = response, next) {
    const url = req.url.replace(/(https?:\/\/)|(\/)+/g, "$1$2");
    if (['/auth', '/app', '/upload', '/user'].some((word) => url.startsWith(word)))
        return next();
    // if(!req.headers['authorization'].startsWith("Bearer ")){
    //     return res.status(401).send(new BaseResponse({success: false, msg: "the authorization must be Bearer", status: 400, lang}));
    // }
    const bearer = req.headers['authorization'];
    let token;
    if (bearer) {
        token = bearer.substring(7, bearer.length);
    }
    console.log(token);
    var lang = req.headers['lang'];
    if (bearer) {
        jwt.verify(token, process.env.TOKEN_KEY,
            async function (err, decoded) {
                if (err) {
                    let errordata = {
                        message: err.message,
                        expiredAt: err.expiredAt
                    };
                    console.log(errordata);
                    return res.status(401).send(new BaseResponse({ success: false, msg: "Unauthorized", status: 401, lang }));
                }
                req.decoded = decoded;
                const user = await User.findOne({ where: { id: decoded.user_id } });
                if (!user) return res.status(401).send(new BaseResponse({ success: false, msg: "Unauthorized", status: 401, lang }));
                next();
            });
    } else {
        return res.status(403).send(new BaseResponse({ success: false, msg: "There is no token provided", status: 403, lang }));
    }
});

module.exports = router;