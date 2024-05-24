const router = require('express').Router();
const dailyTestController = require('../controllers/daily_test.controller');

router.post('/dailyTest', dailyTestController.addDailyTest);
router.get('/dailyTest/list', dailyTestController.getStudentDailyTests);
router.put('/dailyTest', dailyTestController.updateDailyTest);
router.delete('/dailyTest/:id', dailyTestController.deleteDailyTest);

module.exports = router;
