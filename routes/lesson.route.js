const router = require('express').Router();
const lessonController = require('../controllers/lesson.controller');

router.post('/lesson', lessonController.addLesson);
router.get('/lesson/list', lessonController.getStudentLessons);
router.put('/lesson', lessonController.updateLesson);
router.delete('/lesson/:id', lessonController.deleteLesson);

module.exports = router;
