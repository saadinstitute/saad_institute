const router = require('express').Router();
const studentController = require('../controllers/student.controller');

router.post('/student', studentController.addStudent);
router.get('/student/list', studentController.getStudents);
router.put('/student', studentController.updateStudent);
router.delete('/student/:id', studentController.deleteStudent);

module.exports = router;
