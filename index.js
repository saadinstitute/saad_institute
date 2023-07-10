const express = require('express');
const cors = require('cors');
const config =  require('./config.js');
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const appRouter = require('./routes/app.route');
const categoryRouter = require('./routes/category.route.js');
const resturantRouter = require('./routes/resturant.route.js');
const dashboardRouter = require('./routes/dashboard.route.js');
const charityRouter = require('./routes/charity.route.js');
const mealRouter = require('./routes/meal.route.js');
const MealUserFav = require('./models/meal_user_fav.js');
const Meal = require('./models/meal.js');
const Category = require('./models/category.js');
const Resturant = require('./models/resturant.js');
const User = require('./models/user.js');
const Donate = require('./models/donate.js');
const Charity = require('./models/charity.js');
const Course = require('./models/course.js');
const MealsInCourses = require('./models/meals_in_courses.js');
const CourseMeal = require('./models/course_meal.js');
const CourseUser = require('./models/course_user.js');

const port = config.MYSQL_ADDON_PORT ?? 8080;
const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());

User.hasMany(Resturant);
User.hasMany(MealUserFav);
User.belongsToMany(Meal, { through: MealUserFav });
User.belongsToMany(Course, { through: CourseUser });

Resturant.hasMany(Meal);
Resturant.belongsTo(User);
Resturant.hasMany(Donate);

Category.hasMany(Meal);

Charity.hasMany(Donate);

Meal.hasMany(MealUserFav);
Meal.belongsTo(Resturant);
Meal.belongsTo(Category);
Meal.belongsToMany(User, { through: MealUserFav });

Course.belongsToMany(CourseMeal, {through: MealsInCourses});
Course.belongsToMany(User, {through: CourseUser});

CourseMeal.belongsToMany(Course, {through: MealsInCourses});

app.use(middleware);
app.use(userRouter);
app.use(appRouter);
app.use(categoryRouter);
app.use(resturantRouter);
app.use(dashboardRouter);
app.use(charityRouter);
app.use(mealRouter);

app.listen(port, "0.0.0.0", async () => {
    await dbConnection.sync({alter: false, force: false});
    console.log(`Example app listening on port ${port}`);
})
