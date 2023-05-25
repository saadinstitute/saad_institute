const User = require('../models/users');
const jwt = require('jsonwebtoken');
const BaseResponse = require('../models/base_response');
require('dotenv').config();


const register =  async (req, res) => {
    try {
        const reqBody = req.body;
        if(reqBody.type === "user") reqBody.role = "user";
        else if(reqBody.type === "owner") reqBody.role = "admin";
        else return res.send({"msg": "type is require (user || owner)"});
        const user = await User.create(req.body);
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        res.status(201).json({ user, "token": generateToken(user._id) });
    } catch (err) {
        res.send(err);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        if (user.password != password) {
            return res.status(401).send("Password is not correct");
        }
        user.password = undefined;
        res.json(new BaseResponse({user,"token":generateToken(user.id)},{},true));
    } catch (e) {
        console.log(e);
        res.send(e);
    }
};

function generateToken(user_id) {
    const token = jwt.sign(
        { user_id },
        process.env.TOKEN_KEY
    );
    return token;
}


module.exports = {
  register,
  login
};
