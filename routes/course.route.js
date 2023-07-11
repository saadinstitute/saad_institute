const router = require('express').Router();
const courseController = require('../controllers/course.controller');

router.post('/course', courseController.addCourse);
router.get('/course/list', courseController.getCourses);
router.put('/course', courseController.updateCourse);
router.delete('/course/:id', courseController.deleteCourse);
router.post('/course/meal', courseController.addCourseInMeal);
router.delete('/course/meal', courseController.deleteCourseFromMeal);
router.get('/course/meals', courseController.getMeals);

module.exports = router;
