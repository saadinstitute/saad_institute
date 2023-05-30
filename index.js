const express = require('express');
const config =  require('./config.js');
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const appRouter = require('./routes/app.route');
const categoryRouter = require('./routes/category.route.js');

const port = config.MYSQL_ADDON_PORT ?? 8080;
const app = express();

app.use(express.json());
app.use(middleware);
app.use(userRouter);
app.use(appRouter);
app.use(categoryRouter);

app.listen(port,"0.0.0.0", async () => {
    await dbConnection.sync();
    console.log(`Example app listening on port ${port}`)
})
