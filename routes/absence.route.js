const router = require('express').Router();
const absenceController = require('../controllers/absence.controller');

router.post('/absence', absenceController.addAbsence);
router.get('/absence/list', absenceController.getStudentAbsences);
router.put('/absence', absenceController.updateAbsence);
router.delete('/absence/:id', absenceController.deleteAbsence);

module.exports = router;
