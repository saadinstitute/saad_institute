const express = require('express');
const cors = require('cors');
const config =  require('./config.js');
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const daytimeRouter = require('./routes/day_time.route.js');
const klassRouter = require('./routes/klass.route.js');
const marksRouter = require('./routes/test_mark.route.js');
const testNameRouter = require('./routes/test_name.route.js');
const testRouter = require('./routes/test.route.js');
const studentRouter = require('./routes/student.route.js');
const DayTime = require('./models/day_time.js');
const User = require('./models/user.js');
const TestName = require('./models/test_name.js');
const Test = require('./models/test.js');
const Klass = require('./models/klass.js');
const Student = require('./models/student.js');
const TestMark = require('./models/test_mark.js');

const port = config.MYSQL_ADDON_PORT ?? 8080;
const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());

User.hasMany(Test);
User.hasMany(Test);
User.hasMany(Klass);


Klass.belongsTo(User);
Klass.belongsTo(DayTime);

Test.belongsTo(User);
Test.belongsTo(User);
Test.belongsTo(Student);
Test.belongsTo(TestName);
Test.belongsTo(TestMark);

Student.belongsTo(Klass);
Student.belongsTo(Test);

TestMark.belongsTo(Test);

DayTime.hasMany(Klass);

TestName.hasMany(Test)

app.use(middleware);
app.use(userRouter);
app.use(daytimeRouter);
app.use(testNameRouter);
app.use(klassRouter);
app.use(studentRouter);
app.use(testRouter);
app.use(marksRouter);

app.listen("8080", "0.0.0.0", async () => {
  await dbConnection.sync({alter: false, force: false});
    console.log(`Example app listening on port ${port}`);
})