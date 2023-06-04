const router = require('express').Router();
const { getHome} = require('../controllers/dashboard.controller');


router.get('/dashnoard', getHome);

module.exports = router;
