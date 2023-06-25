const router = require('express').Router();
const resturantController = require('../controllers/resturant.controller');

router.post('/resturant', resturantController.addResturant);
router.post('/resturant/donate', resturantController.donate);
router.get('/resturant/list', resturantController.getResturants);
router.put('/resturant', resturantController.updateResturant);
router.delete('/resturant/:id', resturantController.deleteResturant);

module.exports = router;
