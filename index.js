const express = require('express');
require('dotenv').config();
const dbConnection = require('./database/db');
const jwt = require('jsonwebtoken');
const User = require('./models/users');
const port = process.env.MYSQL_ADDON_PORT ?? 8080;
const app = express();

// Middle Ware
app.use(function (req, res, next) {
    if (req.url.startsWith("/login") || req.url.startsWith("/register") || req.url.startsWith("/app"))
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
                    return res.status(401).json({
                        message: 'Unauthorized Access'
                    });
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

app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        res.status(201).json({ user, "token": generateToken(user._id) });
    } catch (err) {
        res.send(err);
    }
});
app.use(express.json());

app.get('/app', async (req, res) => {
    try {
        res.status(200).send({"msg":"it is work fine"});
    } catch (err) {
        res.send(err);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email: email }});
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        if (user.password != password) {
            return res.status(401).send("Password is not correct");
        }
        user.password = undefined;
        res.status(200).json({ user, "token": generateToken(user.id) });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

app.listen(port,"192.168.1.5", async () => {
    await dbConnection.sync();
    console.log(`Example app listening on port ${port}`)
})

function generateToken(user_id) {
    const token = jwt.sign(
        { user_id },
        process.env.TOKEN_KEY
    );
    return token;
}