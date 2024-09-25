const express = require('express');
const cors = require('cors');
const config = require('./config.js');
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const daytimeRouter = require('./routes/day_time.route.js');
const klassRouter = require('./routes/klass.route.js');
const marksRouter = require('./routes/test_mark.route.js');
const testNameRouter = require('./routes/test_name.route.js');
const testRouter = require('./routes/test.route.js');
const studentRouter = require('./routes/student.route.js');
const attendanceRouter = require('./routes/attendance.route.js');
const absenceRouter = require('./routes/absence.route.js');
const lessoneRouter = require('./routes/lesson.route.js');
const dailyTestRouter = require('./routes/daily_test.route.js');
const waqfTestRouter = require('./routes/waqf_test.route.js');
const CategoryRouter = require('./routes/category.route.js');
const AppRouter = require('./routes/app.route.js');
const Category = require('./models/category.js');
const DayTime = require('./models/day_time.js');
const User = require('./models/user.js');
const TestName = require('./models/test_name.js');
const Test = require('./models/test.js');
const Klass = require('./models/klass.js');
const Student = require('./models/student.js');
const TestMark = require('./models/test_mark.js');
const Attendance = require('./models/attendance.js');
const Lesson = require('./models/lesson.js');
const DailyTest = require('./models/daily_test.js');
const WaqfTest = require('./models/waqf_test.js');
const Absence = require('./models/absence.js');

const port = config.MYSQL_ADDON_PORT ?? 8080;
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

User.hasMany(Test);
User.hasMany(Test);
User.hasMany(Klass);


Klass.belongsTo(User,{as:"teacher"});
Klass.belongsTo(DayTime);
Klass.hasMany(Student);

Category.hasMany(Student);

Attendance.belongsTo(Student);

Lesson.belongsTo(Student);

DailyTest.belongsTo(Student);

WaqfTest.belongsTo(Student);

Absence.belongsTo(Student);

Test.belongsTo(User);
Test.belongsTo(User);
Test.belongsTo(Student);
Test.belongsTo(TestName);
Test.hasMany(TestMark, {as: "marks"});

Student.belongsTo(Category);
Student.belongsTo(Klass);
Student.hasMany(Test);
Student.hasMany(Attendance);
Student.hasMany(Lesson);
Student.hasMany(DailyTest);
Student.hasMany(WaqfTest);
Student.hasMany(Absence);

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
app.use(attendanceRouter);
app.use(lessoneRouter);
app.use(absenceRouter);
app.use(CategoryRouter);
app.use(dailyTestRouter);
app.use(waqfTestRouter);
app.use(AppRouter);

app.listen(port, "192.168.43.155", async () => {
  await dbConnection.sync({ alter: false, force: false });
  console.log(`Example app listening on port ${port}`);
})