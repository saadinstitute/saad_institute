const router = require('express').Router();
const attencanceController = require('../controllers/attendance.controller');

router.post('/attencance', attencanceController.addAttencance);
router.get('/attencance/list', attencanceController.getStudentAttendance);
router.put('/attencance', attencanceController.updateAttendance);
router.delete('/attencance/:id', attencanceController.deleteAttendance);

module.exports = router;
