const User = require('../models/users');
const jwt = require('jsonwebtoken');
const BaseResponse = require('../models/base_response');
require('dotenv').config();


const register =  async (req, res) => {
    try {
        const reqBody = req.body;
        if(reqBody.type === "user") reqBody.role = "user";
        else if(reqBody.type === "owner") reqBody.role = "admin";
        else return res.send(new BaseResponse({success:false, msg: `\"type\" is required (user || owner)`}));
        const user = await User.create(req.body);
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.send(new BaseResponse({success:false, msg: "User Already Exist. Please Login"}));
        }
        res.status(201).json(new BaseResponse({ user, "token": generateToken(user._id) }));
    } catch (err) {
        res.send(err);
    }
};

const login = async (req, res) => {
    try {
        console.log(req.params);
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send(new BaseResponse({msg:"User Not Found"}));
        }
        if (user.password != password) {
            return res.status(401).send(new BaseResponse({msg:"Password is not correct"}));
        }
        user.password = undefined;
        console.log(user);
        res.send(new BaseResponse({data: {user,"token":generateToken(user.id)},success: true, msg:"success"}));
    } catch (e) {
        console.log(e);
        res.status(400).send(new BaseResponse({msg: `$e`}));
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
