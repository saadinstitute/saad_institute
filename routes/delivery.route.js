const router = require('express').Router();
const deliveryController = require('../controllers/delivery.controller');

router.post('/delivery', deliveryController.addDelivery);
router.get('/delivery/list', deliveryController.getDeliveries);
router.put('/delivery', deliveryController.updateDelivery);
router.delete('/delivery/:id', deliveryController.deleteDelivery);

module.exports = router;
