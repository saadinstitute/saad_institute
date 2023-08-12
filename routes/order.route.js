const router = require('express').Router();
const orderController = require('../controllers/order.controller');

router.post('/order', orderController.order);
router.get('/order/list', orderController.getAllOrders);
router.put('/order', orderController.updateStatus);

module.exports = router;