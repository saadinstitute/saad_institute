const router = require('express').Router();
const { addCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/category.controller');

router.post('/category', addCategory);
router.get('/category/list', getCategories);
router.put('/category', updateCategory);
router.delete('/category/:id', deleteCategory);

module.exports = router;
