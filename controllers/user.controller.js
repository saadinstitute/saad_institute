const User = require('../models/users');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const BaseResponse = require('../models/base_response');
require('dotenv').config();
const store = require('store')



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'foodies.project5@gmail.com',
        pass: 'jobtgfsmclzwzmiu'
    }
});

const register = async (req, res) => {
    try {
        req.body.isConfirmed ??= false;
        let body = req.body;
        const emailUser = await User.findOne({ where: { email: body.email } });
        if (emailUser) {
            return res.send(new BaseResponse({ success: false, msg: "email is Already Exist.", status: 409 }));
        }
        const userName = await User.findOne({ where: { username: body.username } });
        if (userName) {
            return res.send(new BaseResponse({ success: false, msg: "username is Already Exist.", status: 409 }));
        }
        const userNumber = await User.findOne({ where: { mobile: body.mobile } });
        if (userNumber) {
            return res.send(new BaseResponse({ success: false, msg: "mobile is Already Exist.", status: 409 }));
        }
        if (body.type === "user") body.role = "user";
        else if (body.type === "owner") body.role = "admin";
        else return res.send(new BaseResponse({ success: false, msg: `\"type\" is required (user || owner)` }));
        const user = await User.create(body);
        res.status(201).send(new BaseResponse({ data: { user, "token": generateToken(user.id) }, success: true, msg: `success` }));
    } catch (err) {
        console.log(err);
        res.status(400).send(new BaseResponse({ msg: err.errors, success: false }));
    }
};

const login = async (req, res) => {
    try {
        const { email, password, app } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.send(new BaseResponse({ msg: "User Not Found", status: 404, success: false }));
        }
        if (user.password != password) {
            return res.send(new BaseResponse({ msg: "Password is not correct", status: 401, success: false }));
        }
        if (app === 1 && user.role !== "user") {
            return res.send(new BaseResponse({ msg: "This account is not a user account", status: 401, success: false }));
        }
        if (app === 2 && user.role !== "admin") {
            return res.send(new BaseResponse({ msg: "This account is not an admin", status: 401, success: false }));
        }
        if (app === 3 && user.role !== "superAdmin") {
            return res.send(new BaseResponse({ msg: "This account is not a superAdmin", status: 401, success: false }));
        }
        user.password = undefined;
        res.send(new BaseResponse({ data: { user, "token": generateToken(user.id) }, success: true, msg: `success` }));
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false }));
    }
};

const mailSender = async (req, res) => {
    try {
        const { email } = req.body;
        sendMail(email, "This is test email from backend", (error) => {
            console.log(error);
            res.status(400).send(new BaseResponse({ msg: error, success: false }));
        }, (info) => {
            console.log(info);
            res.send(new BaseResponse({ data: { info }, success: true, msg: "success sending email" }));
        });
    } catch (e) {
        console.log(e);
        res.send(new BaseResponse({ msg: e, success: false }));
    }
};

const verifyAccount = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.send(new BaseResponse({ msg: `The email & code fields are required`, status: 400, success: false }));
        const user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `There is no account with this email ${email}`, status: 404, success: false }));
        const data = await store.get(user.id);
        if (!data) return res.send(new BaseResponse({ msg: `The code is not correct`, status: 404, success: false }));
    } catch (e) {
        console.log(e);
        res.send(new BaseResponse({ msg: e, success: false }));
    }
};

const sendCode = async (req, res) => {
    try {
        const { email } = req.body;
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false }));
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
        text
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
    var expireAt = new Date(oldDateObj.getTime() + diff * 60000);
    const data = { code, expireAt };
    await store.set(userId, data);
}

module.exports = {
    register,
    login,
    mailSender,
    verifyAccount,
    sendCode,
};
