const express = require('express');
const cors = require('cors');
const config =  require('./config.js');
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const appRouter = require('./routes/app.route');
const categoryRouter = require('./routes/category.route.js');
const resturantRouter = require('./routes/resturant.route.js');
const courseRouter = require('./routes/course.route.js');
const dashboardRouter = require('./routes/dashboard.route.js');
const charityRouter = require('./routes/charity.route.js');
const mealRouter = require('./routes/meal.route.js');
const mealCourseRouter = require('./routes/meal_course.route.js');
const deliveryRouter = require('./routes/delivery.route.js');
const reservationRouter = require('./routes/reservation.route.js');
const orderRouter = require('./routes/order.route.js');
const notificationRouter = require('./routes/notification.rout.js');
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
const Order = require('./models/order.js');
const OrderMeal = require('./models/order_meal.js');
const Reservation = require('./models/reservation.js');
const Delivery = require('./models/delivery.js');
const Notification = require('./models/notification.js');

const port = config.MYSQL_ADDON_PORT ?? 8080;
const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());

User.hasMany(Resturant);
User.hasMany(MealUserFav);
User.hasMany(Notification);
User.hasMany(Order);
// User.belongsTo(Reservation);
User.belongsToMany(Meal, { through: MealUserFav });
User.belongsToMany(Course, { through: CourseUser });

// MealUserFav.belongsTo(User);
// MealUserFav.belongsTo(Meal);

Resturant.hasMany(Meal);
Resturant.hasMany(Order);
Resturant.hasMany(Reservation);
Resturant.belongsTo(User);
Resturant.belongsTo(Delivery);
Resturant.hasMany(Donate);

Category.hasMany(Meal);

Charity.hasMany(Donate);

Meal.hasMany(MealUserFav);
Meal.hasMany(OrderMeal);
Meal.belongsTo(Resturant);
Meal.belongsTo(Category);
Meal.belongsToMany(User, { through: MealUserFav });
Meal.belongsToMany(Order, { through: OrderMeal });

// Course.belongsToMany(CourseMeal, {through: MealsInCourses, foreignKey:"courseId"});
Course.belongsToMany(User, {through: CourseUser});
Course.hasMany(CourseUser);
Course.hasMany(MealsInCourses);

// MealsInCourses.belongsTo(Course);
// MealsInCourses.belongsTo(CourseMeal);

// CourseMeal.belongsToMany(Course, {through: MealsInCourses, foreignKey:"mealId"});
CourseMeal.hasMany(MealsInCourses);



Reservation.belongsTo(Order);
Reservation.belongsTo(User);
Reservation.belongsTo(Resturant);
Reservation.hasMany(Notification);

Delivery.hasOne(Resturant);

Order.belongsTo(User);
Order.belongsTo(Resturant);
Order.hasMany(Reservation);
Order.hasMany(OrderMeal);

OrderMeal.belongsTo(Order);
OrderMeal.belongsTo(Meal);

Notification.belongsTo(User);
Notification.belongsTo(Order);
Notification.belongsTo(Reservation);

app.use(middleware);
app.use(userRouter);
app.use(appRouter);
app.use(categoryRouter);
app.use(resturantRouter);
app.use(dashboardRouter);
app.use(charityRouter);
app.use(mealRouter);
app.use(courseRouter);
app.use(mealCourseRouter);
app.use(deliveryRouter);
app.use(reservationRouter);
app.use(orderRouter);
app.use(notificationRouter);

app.listen("8080", "0.0.0.0", async () => {
  await dbConnection.sync({alter: false, force: false});
    console.log(`Example app listening on port ${port}`);
})