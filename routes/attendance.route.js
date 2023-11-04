const router = require('express').Router();
const attencanceController = require('../controllers/attendance.controller');

router.post('/attendance', attencanceController.addAttencance);
router.get('/attendance/list', attencanceController.getStudentAttendance);
router.put('/attendance', attencanceController.updateAttendance);
router.delete('/attendance/:id', attencanceController.deleteAttendance);

module.exports = router;
