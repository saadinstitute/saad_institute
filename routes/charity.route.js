const router = require('express').Router();
const charityController = require('../controllers/charity.controller');

router.post('/charity', charityController.addCharity);
router.get('/charity/list', charityController.getCharities);
router.put('/charity', charityController.updateCharity);
router.delete('/charity/:id', charityController.deleteCharity);

module.exports = router;
