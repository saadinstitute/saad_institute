const router = require('express').Router();
const klassController = require('../controllers/klass.controller');

router.post('/klass', klassController.addKlass);
router.get('/klass/list', klassController.getKlasses);
router.put('/klass', klassController.updateKlass);
router.delete('/klass/:id', klassController.deleteKlass);

module.exports = router;
