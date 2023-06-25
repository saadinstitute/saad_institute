const router = require('express').Router();
const userController = require('../controllers/user.controller');

router.post('/auth/login', userController.login);
router.post('/auth/register', userController.register);
router.post('/auth/testMail', userController.mailSender);
router.post('/auth/verifyAccount', userController.verifyAccount);
router.post('/auth/sendCode', userController.sendCode);
router.post('/auth/forgetPassword', userController.forgetPassword);
router.post('/auth/resetPassword', userController.resetPassword);
router.get('/users', userController.users);
router.post('/user', userController.addUser);
router.put('/user', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

module.exports = router;
