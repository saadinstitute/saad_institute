const express = require('express');
const cors = require('cors');
const config =  require('./config.js');
const dbConnection = require('./database/db');
const middleware = require('./others/middleware');
const userRouter = require('./routes/user.route');
const daytimeRouter = require('./routes/day_time.route.js');
const klassRouter = require('./routes/klass.route.js');
// const courseRouter = require('./routes/course.route.js');
// const dashboardRouter = require('./routes/dashboard.route.js');
const testNameRouter = require('./routes/test_name.route.js');
const studentRouter = require('./routes/student.route.js');
// const mealCourseRouter = require('./routes/meal_course.route.js');
// const deliveryRouter = require('./routes/delivery.route.js');
// const reservationRouter = require('./routes/reservation.route.js');
// const orderRouter = require('./routes/order.route.js');
// const notificationRouter = require('./routes/notification.rout.js');
// const MealUserFav = require('./models/meal_user_fav.js');
// const Meal = require('./models/meal.js');
const DayTime = require('./models/day_time.js');
// const Resturant = require('./models/resturant.js');
const User = require('./models/user.js');
// const Donate = require('./models/donate.js');
const TestName = require('./models/test_name.js');
const Klass = require('./models/klass.js');
const Student = require('./models/student.js');
// const Course = require('./models/course.js');
// const MealsInCourses = require('./models/meals_in_courses.js');
// const CourseMeal = require('./models/course_meal.js');
// const CourseUser = require('./models/course_user.js');
// const Order = require('./models/order.js');
// const OrderMeal = require('./models/order_meal.js');
// const Reservation = require('./models/reservation.js');
// const Delivery = require('./models/delivery.js');
// const Notification = require('./models/notification.js');

const port = config.MYSQL_ADDON_PORT ?? 8080;
const app = express();

app.use(cors({origin: "*"}));
app.use(express.json());

// User.hasMany(Resturant);
// User.hasMany(MealUserFav);
// User.hasMany(Notification);
// User.hasMany(Order);
// User.belongsToMany(Meal, { through: MealUserFav });
// User.belongsToMany(Course, { through: CourseUser });


// Resturant.hasMany(Meal);
// Resturant.hasMany(Order);
// Resturant.hasMany(Reservation);
Klass.belongsTo(User);
Klass.belongsTo(DayTime);
// Resturant.hasMany(Donate);

// Category.hasMany(Meal);

// Charity.hasMany(Donate);

// Meal.hasMany(MealUserFav);
// Meal.hasMany(OrderMeal);
Student.belongsTo(Klass);
// Meal.belongsTo(Category);
// Meal.belongsToMany(User, { through: MealUserFav });
// Meal.belongsToMany(Order, { through: OrderMeal });

// Course.belongsToMany(User, {through: CourseUser});
// Course.hasMany(CourseUser);
// Course.hasMany(MealsInCourses);

// CourseMeal.hasMany(MealsInCourses);



// Reservation.belongsTo(Order);
// Reservation.belongsTo(User);
// Reservation.belongsTo(Resturant);
// Reservation.hasMany(Notification);

// Delivery.hasOne(Resturant);

// Order.belongsTo(User);
// Order.belongsTo(Resturant);
// Order.hasMany(Reservation);
// Order.hasMany(OrderMeal);

// OrderMeal.belongsTo(Order);
// OrderMeal.belongsTo(Meal);

// Notification.belongsTo(User);
// Notification.belongsTo(Order);
// Notification.belongsTo(Reservation);

app.use(middleware);
app.use(userRouter);
app.use(daytimeRouter);
app.use(testNameRouter);
app.use(klassRouter);
app.use(studentRouter);
// app.use(dashboardRouter);
// app.use(mealRouter);
// app.use(courseRouter);
// app.use(mealCourseRouter);
// app.use(deliveryRouter);
// app.use(reservationRouter);
// app.use(orderRouter);
// app.use(notificationRouter);

app.listen("8080", "0.0.0.0", async () => {
  await dbConnection.sync({alter: false, force: false});
    console.log(`Example app listening on port ${port}`);
})