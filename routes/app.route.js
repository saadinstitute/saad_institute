const router = require('express').Router();
const { checkServer} = require('../controllers/app.controller');


router.get('/app', checkServer);

module.exports = router;
