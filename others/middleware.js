const { request, response } = require('express');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const BaseResponse = require('../models/base_response');

router.use(function (req = request, res = response, next) {
    const url = req.url.replace(/(https?:\/\/)|(\/)+/g, "$1$2");
    console.log(url);
    if (['/auth', '/app', '/upload', '/tmp'].some((word) => url.startsWith(word)))
        return next();
    var token = req.headers['authorization'];
    if (token) {
        jwt.verify(token, process.env.TOKEN_KEY,
            function (err, decoded) {
                if (err) {
                    let errordata = {
                        message: err.message,
                        expiredAt: err.expiredAt
                    };
                    console.log(errordata);
                    return res.status(401).send(new BaseResponse({success: false, msg: "Unauthorized",status: 401}));
                }
                req.decoded = decoded;
                next();
            });
    } else {
        return res.status(403).send(new BaseResponse({success: false, msg: "Forbidden Access",status: 403}));
    }
});

module.exports = router;