const router = require('express').Router();
const testController = require('../controllers/test.controller');

router.post('/testName', testController.addTest);
router.get('/testName/list', testController.getTests);
router.put('/testName', testController.updateTest);
// router.delete('/testName/:id', testController.deleteTestName);

module.exports = router;
