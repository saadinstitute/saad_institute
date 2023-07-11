const router = require('express').Router();
const mealCourseController = require('../controllers/meal_course.controller');

router.post('/mealCourse', mealCourseController.addMeal);
router.get('/mealCourse/list', mealCourseController.getMeals);
router.put('/mealCourse', mealCourseController.updateMeal);
router.delete('/mealCourse/:id', mealCourseController.deleteMeal);

module.exports = router;
