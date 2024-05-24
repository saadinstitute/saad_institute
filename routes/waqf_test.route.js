const router = require('express').Router();
const waqfTestController = require('../controllers/waqf_test.controller');

router.post('/waqfTest', waqfTestController.addWaqfTest);
router.get('/waqfTest/list', waqfTestController.getStudentWaqfTests);
router.put('/waqfTest', waqfTestController.updateWaqfTest);
router.delete('/waqfTest/:id', waqfTestController.deleteWaqfTest);

module.exports = router;
