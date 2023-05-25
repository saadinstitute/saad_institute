const router = require('express').Router();
const { register, login } = require('../controllers/user.controller');

router.post('/login', register);
router.post('/register', login);

module.exports = router;
