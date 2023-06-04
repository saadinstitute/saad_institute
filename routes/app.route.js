const router = require('express').Router();
const { checkServer, showDashboard} = require('../controllers/app.controller');


router.get('/web', showDashboard);
router.get('/app', checkServer);

module.exports = router;
