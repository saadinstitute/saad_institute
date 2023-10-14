const User = require('../models/user');
const jwt = require('jsonwebtoken');

async function validateSuperAdmin(req) {
    const data = await jwt.verify(token(req), process.env.TOKEN_KEY,
        async function (err, decoded) {
            if (err) {
                let errordata = {
                    message: err.message,
                    expiredAt: err.expiredAt
                };
                console.log(errordata);
                throw err;
            }
            return decoded;
        });
    const user = await User.findOne({ where: { id: data.user_id } });
    if (!user) throw "there is no user with this token";
    if (user.role !== "superAdmin") throw "permission denied";
    if (!user.isConfirmed) throw "your account need to be confirmed";
    // return user;

}

async function validateAdmin(req) {
    const data = await jwt.verify(token(req), process.env.TOKEN_KEY,
        async function (err, decoded) {
            if (err) {
                let errordata = {
                    message: err.message,
                    expiredAt: err.expiredAt
                };
                console.log(errordata);
                throw err;
            }
            return decoded;
        });
    const user = await User.findOne({ where: { id: data.user_id } });
    if (!user) throw { message: "there is no user with this token" };
    if (!user.isConfirmed) throw { message: "your account need to be confirmed" };
    if (user.role !== "superAdmin" || user.role !== "admin") return user;
    throw { message: "permission denide" };

}

async function validateUser(req) {
    const data = await jwt.verify(token(req), process.env.TOKEN_KEY,
        async function (err, decoded) {
            if (err) {
                let errordata = {
                    message: err.message,
                    expiredAt: err.expiredAt
                };
                console.log(errordata);
                throw err;
            }
            return decoded;
        });
    const user = await User.findOne({ where: { id: data.user_id } });
    if (!user) throw { message: "there is no user with this token" };
    return user;

}

function token(req) {
    const bearer = req.headers["authorization"];
    return bearer.substring(7, bearer.length);
}

module.exports = { validateSuperAdmin, validateAdmin, validateUser };