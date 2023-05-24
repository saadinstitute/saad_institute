const express = require('express');
require('dotenv').config();
const dbConnection = require('./database/db');
const jwt = require('jsonwebtoken');
const sequelize = require('sequelize');
const User = require('./models/users');
const Task = require('./models/tasks');
const Tag = require('./models/tag');
const port = process.env.MYSQL_ADDON_PORT ?? 8080;
const app = express();

// Single routing
const router = express.Router();
 
router.get('/', function (req, res, next) {
    const decodedToken = jwt.decode(req.headers.token);
    console.log(decodedToken);
    res.end();
})
 
app.use(router);
app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        res.status(201).json({ user, "token":generateToken(user._id) });
    } catch (err) {
        res.send(err);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
        return res.status(404).send("User Not Found");
    }
    if(user.password != password){
        return res.status(404).send("Password is not correct");
    }
    res.status(200).json({ user, "token":generateToken(user.id) });
});

app.get('/', (req, res) => {
    res.statusCode(404);
});

app.get('/users', async (req, res) => {
    const users = await User.findAll({attributes: {exclude: ['password']}});
    res.status(200).json({ user, "token":generateToken(user._id) });
});

app.listen(port, async () => {
    await dbConnection.sync();
    console.log(`Example app listening on port ${port}`)
})


function generateToken(user_id){
    const token = jwt.sign(
        {user_id},
        process.env.TOKEN_KEY
    );
    return token;
}