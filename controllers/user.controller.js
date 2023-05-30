const User = require('../models/users');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const BaseResponse = require('../models/base_response');
// require('dotenv').config();
const config =  require('../config.js');
const store = require('store')



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'foodies.project5@gmail.com',
        pass: config.EMAIL_PASS
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
        else if (body.type === "superAdmin") body.role = "superAdmin";
        else return res.send(new BaseResponse({ success: false, msg: `"type" is required (user || owner)` }));
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
        if(app < 1 || app > 3) return res.send(new BaseResponse({ msg: "app value is not correct", status: 400, success: false }));
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
        let user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `There is no account with this email ${email}`, status: 404, success: false }));
        const data = await store.get(user.id);
        if (!data) return res.send(new BaseResponse({ msg: `The code is not correct`, status: 498, success: false }));
        const now = new Date();
        if (now > data.expireAt) return res.send(new BaseResponse({ msg: `The code is not expired`, status: 498, success: false }));
        user.isConfirmed = true;
        await user.save();
        res.send(new BaseResponse({ msg: `Your account have been confirmed`, success: true }));
    } catch (e) {
        console.log(e);
        res.send(new BaseResponse({ msg: e, success: false }));
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) return res.send(new BaseResponse({ msg: `The (email & code & newPassword) fields are required`, status: 400, success: false }));
        let user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `There is no account with this email ${email}`, status: 404, success: false }));
        const data = await store.get(user.id);
        if (!data) return res.send(new BaseResponse({ msg: `The code is not correct`, status: 498, success: false }));
        const now = new Date();
        if (now > data.expireAt) return res.send(new BaseResponse({ msg: `The code is not expired`, status: 498, success: false }));
        user.password = newPassword;
        await user.save();
        res.send(new BaseResponse({ msg: `Your new password has been set`, success: true }));
    } catch (e) {
        console.log(e);
        res.send(new BaseResponse({ msg: e, success: false }));
    }
};

const sendCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.send(new BaseResponse({ msg: `The email field are required`, status: 400, success: false }));
        const user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `There is no account with this email ${email}`, status: 404, success: false }));
        const code = await saveUserCode(user.id);
        sendMail(email, mailHtml(code, "verify your account"), (e) => {
            res.send(new BaseResponse({ msg: `There is someting wrong, please try again later`, success: false }));
        }, (s) => {
            res.send(new BaseResponse({ msg: `The verify code have been send to the email`, success: true }));
        });
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({ msg: e, success: false }));
    }
};

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.send(new BaseResponse({ msg: `The email field are required`, status: 400, success: false }));
        const user = await User.findOne({ where: { email } });
        if (!user) return res.send(new BaseResponse({ msg: `There is no account with this email ${email}`, status: 404, success: false }));
        const code = await saveUserCode(user.id);
        sendMail(email, mailHtml(code, "reset your password"), (e) => {
            res.send(new BaseResponse({ msg: `There is someting wrong, please try again later`, success: false }));
        }, (s) => {
            res.send(new BaseResponse({ msg: `The code have been send to the email`, success: true }));
        });
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

module.exports = {
    register,
    login,
    mailSender,
    verifyAccount,
    sendCode,
    forgetPassword,
    resetPassword,
};
