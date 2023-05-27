const router = require('express').Router();
const { register, login, mailSender, verifyAccount, sendCode, forgetPassword, resetPassword } = require('../controllers/user.controller');

router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/testMail', mailSender);
router.post('/auth/verifyAccount', verifyAccount);
router.post('/auth/sendCode', sendCode);
router.post('/auth/forgetPassword', forgetPassword);
router.post('/auth/resetPassword', resetPassword);

module.exports = router;
