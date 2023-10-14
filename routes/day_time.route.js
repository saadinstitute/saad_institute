const router = require('express').Router();
const daytimeController = require('../controllers/day_time.controller');

router.post('/daytime', daytimeController.addDayTime);
router.get('/daytime/list', daytimeController.getDayTimes);
router.put('/daytime', daytimeController.updateDayTime);
router.delete('/daytime/:id', daytimeController.deleteDayTime);

module.exports = router;
