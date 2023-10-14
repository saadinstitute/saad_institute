const router = require('express').Router();
const testNameController = require('../controllers/test_name.controller');

router.post('/testName', testNameController.addTestName);
router.get('/testName/list', testNameController.getTestNames);
router.put('/testName', testNameController.updateTestName);
router.delete('/testName/:id', testNameController.deleteTestName);

module.exports = router;
