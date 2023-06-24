const router = require('express').Router();
const mealController = require('../controllers/meal.controller');

router.post('/meal', mealController.addMeal);
router.post('/meal/fav', mealController.editFavMeal);
router.get('/meal/list', mealController.getMeals);
router.put('/meal', mealController.updateMeal);
router.delete('/meal/:id', mealController.deleteMeal);

module.exports = router;
