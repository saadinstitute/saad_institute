const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const BaseResponse = require('../models/base_response');
const cloudinary = require('../others/cloudinary.config');
const config = require('../config.js');
const store = require('store');
const formidable = require('formidable');
const { validateSuperAdmin, validateUser  } = require("../others/validator");
const { Op } = require("sequelize");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'foodies.project5@gmail.com',
        pass: config.EMAIL_PASS
    }
});

const users = async (req, res) => {
    const lang = req.headers["lang"];
    try {
        const msg = await validateSuperAdmin(req);
        if (msg) 
            return res.send(new BaseResponse({ success: false, status: 403, msg, lang }));
        const { pageSize = 10, page = 0, search} = req.query;
        const size = Number(pageSize) ?? 10;
        const start = Number(page) ?? 0;
        let query = {};
        if(search);
        query = {[Op.or]:[
            {
                username:{
                    [Op.like]: `%${search}%`
                }
            },
            {
                email:{
                    [Op.like]: `%${search}%`
                }
            }
        ]};
        const data = await User.findAndCountAll({where: query ,offset: start * size, limit: size,attributes: { exclude: ['password'] }});
        const users = data.rows;
        const usersCount = data.count;
        res.send(new BaseResponse({ data: users, success: true, msg: "success", lang, pagination: {total: usersCount, page: start, pageSize: size} }));
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
            return res.send(new BaseResponse({ success: false, msg: "email is already exist", status: 409, lang }));
        }
        const userName = await User.findOne({ where: { username: body.username } });
        if (userName) {
            return res.send(new BaseResponse({ success: false, msg: "username is already exist", status: 409, lang }));
        }
        const userNumber = await User.findOne({ where: { mobile: body.mobile } });
        if (userNumber) {
            return res.send(new BaseResponse({ success: false, msg: "mobile is already exist", status: 409, lang }));
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
        const data = await getFormFromReq(req);
        const msg = await validateSuperAdmin(req);
        if (msg) {
            return res.send(new BaseResponse({ success: false, msg: msg, status: 401, lang }));
        }
        let body = data;
        if (body.type === "user") body.role = "user";
        else if (body.type === "owner") body.role = "admin";
        else if (body.type === "superAdmin") body.role = "superAdmin";
        else return res.send(new BaseResponse({ success: false, msg: "type is required (user || owner)", lang }));
        if (body.image) {
            const resCloudinary = await cloudinary.uploader.upload(body.image.filepath);
            body.imageUrl = resCloudinary.url;
        }
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
        const { email, password, app, fbToken } = req.body;
        if (!app) {
            return res.send(new BaseResponse({ msg: "app field is required", status: 400, success: false, lang }));
        }
        const appNum = Number(app);
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.send(new BaseResponse({ msg: "user not found", status: 404, success: false, lang }));
        }
        if (user.password != password) {
            return res.send(new BaseResponse({ msg: "password is not correct", status: 403, success: false, lang }));
        }
        if (appNum === 1 && user.role !== "user") {
            return res.send(new BaseResponse({ msg: "this account is not a user account", status: 403, success: false, lang }));
        }
        if (appNum === 2 && user.role !== "admin") {
            return res.send(new BaseResponse({ msg: "this account is not an admin", status: 403, success: false, lang }));
        }
        if (appNum === 3 && user.role !== "superAdmin") {
            return res.send(new BaseResponse({ msg: "this account is not a superAdmin", status: 403, success: false, lang }));
        }
        if (appNum < 1 || appNum > 3) return res.send(new BaseResponse({ msg: "app value is not correct", status: 400, success: false, lang }));
        if(fbToken){
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
        const client = await validateUser(req);
        const data = await getFormFromReq(req);
        if (!data.id) return res.send(new BaseResponse({ success: false, status: 403, msg: "id field is required", lang }));
        const user = await User.findOne({ where: { id: data.id }, attributes: {exclude:["password"]} });
        if (!user) return res.send(new BaseResponse({ success: false, status: 404, msg: "user not found", lang }));
        if(client.id !== user.id && client.role !== "superAdmin"){
            return res.send(new BaseResponse({ success: false, status: 403, msg: "you can't edit this account", lang }));
        }
        if (data.image) {
            const resCloudinary = await cloudinary.uploader.upload(data.image.filepath);
            user.imageUrl = resCloudinary.url ?? user.imageUrl;
        }
        const { fullName, dateOfBirth, mobile, gender, address } = data;
        if(fullName && fullName !== "") user.fullName = fullName;
        if(dateOfBirth && dateOfBirth !== "") user.dateOfBirth = dateOfBirth;
        if(mobile && mobile !== "") user.mobile = mobile;
        if(gender && gender !== "") user.gender = gender;
        if(address && address !== "") user.address = address;
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
        if(!req.params.id) return res.send(new BaseResponse({ success: false, status: 400, msg: "id param is required", lang }));
        const id = req.params.id;
        const user = await User.findOne({ where:{ id }});
        if(!user) return res.send(new BaseResponse({ success: false, status: 404, msg: "user not found", lang }));
        if(reqestedBy.id === user.id) return res.send(new BaseResponse({ success: false, status: 404, msg: "you can't delete your account", lang }));
        const isSuccess = !(!(await user.destroy()));
        res.send(new BaseResponse({ success: !(!isSuccess), msg: isSuccess?"deleted successfully":"there is someting wrong, please try again later", lang }));
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

function sendMail(to, text, errorFun, successFun) {
    var mailOptions = {
        from: 'foodies.project5@gmail.com',
        to,
        subject: 'Confirm email from Foodies ^_^',
        html: text
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            errorFun(error);
        } else {
            successFun(info.response);
        }
    });
}

async function saveUserCode(userId) {
    const code = Math.floor(Math.random() * 90000) + 10000;
    var expireAt = new Date(new Date() + 30 * 60000);
    const data = { code, expireAt };
    await store.set(userId, data);
    return code;
}

function mailHtml(code, reason) {
    return `<td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
    <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
    <tbody>
    <tr><td style="padding: 40px 0px 0px;">
    <div style="text-align: center;"><div style="padding-bottom: 20px;">
    <img src="https://i.ibb.co/9h7jksF/foodies-logo.png" alt="Foodies" width="100"></div>
    </div> <div style="padding: 20px; background-color: rgb(255, 255, 255);"><div style="color: rgb(0, 0, 0); text-align: center;">
    <h1 style="margin: 1rem 0">Verification code</h1>
    <p style="padding-bottom: 16px">Please use the verification code below to ${reason}.</p><p style="padding-bottom: 16px">
    <strong style="font-size: 130%">${code}</strong></p>
    <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
    <p style="padding-bottom: 16px">Thanks,<br>Foodies team</p></div>
    </div> <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;"></div></td></tr></tbody></table></td>`;
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
