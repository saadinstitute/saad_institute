const express = require('express');
require('dotenv').config();
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const appRouter = require('./routes/app.route');

const port = process.env.MYSQL_ADDON_PORT ?? 8080;
const app = express();

// Middle Ware
app.use(middleware);
app.use(userRouter);
app.use(appRouter);
app.use(express.json());

app.listen(port, "192.168.1.6", async () => {
    await dbConnection.sync();
    console.log(`Example app listening on port ${port}`)
})
