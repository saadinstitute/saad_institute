const router = require('express').Router();
const categoryController = require('../controllers/category.controller');

router.post('/category', categoryController.addCategory);
router.get('/category/list', categoryController.getCategories);
router.get('/category/:resturantId', categoryController.getResturantCategories);
router.put('/category', categoryController.updateCategory);
router.delete('/category/:id', categoryController.deleteCategory);

module.exports = router;
