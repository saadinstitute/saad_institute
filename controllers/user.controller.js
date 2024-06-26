const User = require('../models/user');
const jwt = require('jsonwebtoken');
const BaseResponse = require('../models/base_response');
const cloudinary = require('../others/cloudinary.config');
const config = require('../config.js');
const store = require('store');
const formidable = require('formidable');
const { validateSuperAdmin, validateAdmin, validateUser } = require("../others/validator");
const { Op } = require("sequelize");

const users = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { pageSize = 10, page = 0, search, role } = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        const user = await validateUser(req);
        if (role && (user.role === "admin" || user.role === "superAdmin" || (role !== "admin" && role !== "superAdmin"))) {
            query.role = role;
        }
        else if (user.role !== "admin" && user.role !== "superAdmin") {
            query.role = ["tester", "teacher"];
        }
        if (search) {
            query = {
                [Op.or]: [
                    {
                        firstName: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        lastName: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        mobile: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
            };
        }
        const data = await User.findAndCountAll({
            where: query,
            offset: start * size,
            limit: size,
            // attributes: user.role === "admin" || user.role === "superAdmin"?{
            //     exclude: ['password']
            // }:{}
        },
        );
        const users = data.rows;
        const usersCount = data.count;
        res.send(new BaseResponse({ data: users, success: true, msg: "success", lang, pagination: { total: usersCount, page: start, pageSize: size } }));
    } catch (err) {
        console.log(err);
        res.status(400).send(new BaseResponse({ msg: err, success: false, status: 400, lang }));
    }
};

const register = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        req.body.isConfirmed ??= false;
        let body = req.body;
        const emailUser = await User.findOne({ where: { email: body.email } });
        if (emailUser) {
            return res.status(409).send(new BaseResponse({ success: false, msg: "email is already exist", status: 409, lang }));
        }
        const userName = await User.findOne({ where: { username: body.username } });
        if (userName) {
            return res.status(409).send(new BaseResponse({ success: false, msg: "username is already exist", status: 409, lang }));
        }
        const userNumber = await User.findOne({ where: { mobile: body.mobile } });
        if (userNumber) {
            return res.status(409).send(new BaseResponse({ success: false, msg: "mobile is already exist", status: 409, lang }));
        }
        if (body.type === "user") body.role = "user";
        else if (body.type === "owner") body.role = "admin";
        else if (body.type === "superAdmin") body.role = "superAdmin";
        else return res.send(new BaseResponse({ success: false, msg: `type is required (user || owner)`, lang }));
        body.type = undefined;
        console.log(body);
        const user = await User.create(body);
        res.status(201).send(new BaseResponse({ data: { user, "token": generateToken(user.id) }, success: true, msg: "success", lang }));
    } catch (err) {
        console.log(err);
        res.status(400).send(new BaseResponse({ msg: err, success: false, lang }));
    }
};

const addUser = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const body = req.body;
        // await validateAdmin(req);
        const user = await User.create(body);
        res.status(201).send(new BaseResponse({ data: user, success: true, msg: "success", lang }));
    } catch (err) {
        console.log(err);
        res.status(400).send(new BaseResponse({ msg: err, success: false, lang }));
    }
};

const login = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { mobile, password, fbToken } = req.body;
        const user = await User.findOne({ where: { mobile } });
        if (!user) {
            return res.status(404).send(new BaseResponse({ msg: "user not found", status: 404, success: false, lang }));
        }
        if (user.password != password) {
            return res.status(403).send(new BaseResponse({ msg: "password is not correct", status: 403, success: false, lang }));
        }
        if (fbToken) {
            user.fbToken = fbToken;
            await user.save();
        }
        user.password = undefined;
        res.send(new BaseResponse({ data: { user, "token": generateToken(user.id) }, success: true, msg: "success", lang }));
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false, lang }));
    }
};

const mailSender = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { email } = req.body;
        sendMail(email, "this is test email from backend", (error) => {
            console.log(error);
            res.status(400).send(new BaseResponse({ msg: error, success: false, lang }));
        }, (info) => {
            console.log(info);
            res.send(new BaseResponse({ data: { info }, success: true, msg: "success", lang }));
        });
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false, lang }));
    }
};

const verifyAccount = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.send(new BaseResponse({ msg: "the email & code fields are required", status: 400, success: false, lang }));
        let user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `there is no account with this email`, status: 404, success: false, lang }));
        const data = await store.get(user.id);
        if (!data) return res.send(new BaseResponse({ msg: "the code is not correct", status: 498, success: false, lang }));
        const now = new Date();
        if (now > data.expireAt) return res.send(new BaseResponse({ msg: "the code is not expired", status: 498, success: false, lang }));
        user.isConfirmed = true;
        await user.save();
        res.send(new BaseResponse({ msg: "your account have been confirmed", success: true, lang }));
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false, lang }));
    }
};

const resetPassword = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) return res.send(new BaseResponse({ msg: `the (email & code & newPassword) fields are required`, lang, status: 400, success: false }));
        let user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `there is no account with this email`, status: 404, success: false, lang }));
        const data = await store.get(user.id);
        if (!data) return res.send(new BaseResponse({ msg: `the code is not correct`, status: 498, success: false, lang }));
        const now = new Date();
        if (now > data.expireAt) return res.send(new BaseResponse({ msg: `the code is not expired`, status: 498, success: false, lang }));
        user.password = newPassword;
        await user.save();
        res.send(new BaseResponse({ msg: `your new password has been set`, success: true, lang }));
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false, lang }));
    }
};

const sendCode = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const { email } = req.body;
        if (!email) return res.send(new BaseResponse({ msg: `the email field is required`, status: 400, success: false, lang }));
        const user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `there is no account with this email`, status: 404, success: false, lang }));
        const code = await saveUserCode(user.id);
        sendMail(email, mailHtml(code, "verify your account"), (e) => {
            res.send(new BaseResponse({ msg: `there is someting wrong, please try again later`, success: false, lang }));
        }, (s) => {
            res.send(new BaseResponse({ msg: `the verify code have been send to the email`, success: true, lang }));
        });
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false, lang }));
    }
};

const forgetPassword = async (req, res) => {
    try {
        const lang = req.headers["lang"];
        const { email } = req.body;
        if (!email) return res.send(new BaseResponse({ msg: "the email field is required", status: 400, success: false, lang }));
        const user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: "there is no account with this email", status: 404, success: false, lang }));
        const code = await saveUserCode(user.id);
        sendMail(email, mailHtml(code, "reset your password"), (e) => {
            res.send(new BaseResponse({ msg: "there is someting wrong, please try again later", success: false, lang }));
        }, (s) => {
            res.send(new BaseResponse({ msg: "the code have been send to the email", success: true, lang }));
        });
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false }));
    }
};

const updateUser = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        await validateAdmin(req);
        const data = req.body;
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "id field is required", lang }));
        const user = await User.findByPk(data.id);
        if (!user) return res.send(new BaseResponse({ success: false, status: 404, msg: "user not found", lang }));
        // if (client.id !== user.id && client.role !== "superAdmin" && client.role !== "admin") {
        //     return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't edit this account", lang }));
        // }
        const { firstName, lastName, password, fatherName, mobile, landlinePhone, dateOfBirth, placeOfBirth, joinedAt, currentAddress, permanintAddress, isMarried, nationalId, brothers, sisters, currentWork, gender, role, isConfirmed } = data;
        if (user.isConfirmed && !isConfirmed) {
            const confirmedUsers = await User.count({
                where: {
                    isConfirmed: true
                }
            });
            if (confirmedUsers === 1) {
                return res.send(new BaseResponse({ success: false, status: 403, msg: "there should be at least one confirmed account", lang }));
            }
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.fatherName = fatherName;
        if (password) {
            user.password = password;
        }
        user.dateOfBirth = dateOfBirth;
        user.joinedAt = joinedAt;
        user.placeOfBirth = placeOfBirth;
        user.mobile = mobile;
        user.landlinePhone = landlinePhone;
        user.gender = gender;
        user.currentAddress = currentAddress;
        user.permanintAddress = permanintAddress;
        user.isMarried = Boolean(isMarried);
        user.nationalId = nationalId;
        user.brothers = Number(brothers);
        user.sisters = Number(sisters);
        user.currentWork = currentWork;
        user.role = role;
        user.isConfirmed = Boolean(isConfirmed);
        await user.save();
        res.send(new BaseResponse({ data: user, success: true, msg: "updated successfully", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

const deleteUser = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const msg = await validateSuperAdmin(req);
        const reqestedBy = await validateUser(req);
        if (msg) return res.send(new BaseResponse({ success: false, status: 403, msg: msg, lang }));
        if (!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const user = await User.findOne({ where: { id } });
        if (!user) return res.send(new BaseResponse({ success: false, status: 404, msg: "user not found", lang }));
        if (reqestedBy.id === user.id) return res.send(new BaseResponse({ success: false, status: 404, msg: "you can't delete your account", lang }));
        const isSuccess = !(!(await user.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess ? "deleted successfully" : "there is someting wrong, please try again later", lang }));
    } catch (error) {
        console.log(error);
        res.status(400).send(new BaseResponse({ success: false, msg: error, lang }));
    }
};

function generateToken(user_id) {
    const token = jwt.sign(
        { user_id },
        process.env.TOKEN_KEY
    );
    return token;
}

async function saveUserCode(userId) {
    const code = Math.floor(Math.random() * 90000) + 10000;
    var expireAt = new Date(new Date() + 30 * 60000);
    const data = { code, expireAt };
    await store.set(userId, data);
    return code;
}

function getFormFromReq(req) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ ...fields, ...files });
        });
    });
}

module.exports = {
    register,
    login,
    mailSender,
    verifyAccount,
    sendCode,
    forgetPassword,
    resetPassword,
    users,
    deleteUser,
    addUser,
    updateUser,
};
