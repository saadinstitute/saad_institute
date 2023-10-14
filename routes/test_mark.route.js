const router = require('express').Router();
const testMarkController = require('../controllers/test_mark.controller');

router.post('/mark', testMarkController.addMark);
router.get('/mark/list', testMarkController.getTestMarks);
router.put('/mark', testMarkController.updateTestMark);
router.delete('/mark/:id', testMarkController.deleteTestMark);

module.exports = router;
