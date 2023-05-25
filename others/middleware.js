const { request, response } = require('express');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const BaseResponse = require('../models/base_response');

router.use(function (req = request, res = response, next) {
    if (['/login', '/register', '/app'].some((word) => req.url.startsWith(word)))
        return next();
    var token = req.headers['x-access-token'];
    console.log(token);
    if (token) {
        jwt.verify(token, process.env.TOKEN_KEY,
            function (err, decoded) {
                if (err) {
                    let errordata = {
                        message: err.message,
                        expiredAt: err.expiredAt
                    };
                    console.log(errordata);
                    return res.status(401).send(new BaseResponse({success: false, msg: "Unauthorized"}));
                }
                req.decoded = decoded;
                console.log(decoded);
                next();
            });
    } else {
        return res.status(403).json({
            message: 'Forbidden Access'
        });
    }
});

module.exports = router;