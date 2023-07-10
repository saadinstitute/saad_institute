const router = require('express').Router();
const courseController = require('../controllers/course.controller');

router.post('/course', courseController.addCourse);
router.get('/course/list', courseController.getCourses);
router.put('/course', courseController.updateCourse);
router.delete('/course/:id', courseController.deleteCourse);

module.exports = router;
