const router = require('express').Router();
const testController = require('../controllers/test.controller');

router.post('/test', testController.addTest);
router.get('/test/list', testController.getTests);
router.post('/test/reset/:id', testController.resetTest);
router.put('/test', testController.updateTest);
router.delete('/test/:id', testController.deleteTest);

module.exports = router;
