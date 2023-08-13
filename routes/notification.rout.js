const router = require('express').Router();
const notificatoinsController = require('../controllers/notification.controller');

router.get('/notifications/list', notificatoinsController.getNotifications);

module.exports = router;
