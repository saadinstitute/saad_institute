const router = require('express').Router();
const { register, login, mailSender, verifyAccount, sendCode } = require('../controllers/user.controller');

router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/testMail', mailSender);
router.post('/auth/verifyAccount', verifyAccount);
router.post('/auth/sendCode', sendCode);

module.exports = router;
