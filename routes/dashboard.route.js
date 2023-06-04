const router = require('express').Router();
const { getHome} = require('../controllers/dashboard.controller');


router.get('/dashboard', getHome);

module.exports = router;
