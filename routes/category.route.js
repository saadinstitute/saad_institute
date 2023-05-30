const router = require('express').Router();
const multer = require("multer");
const { addCategory } = require('../controllers/category.controller');

const uploadMutler = multer({dest: 'files/categories/'});

router.post('/category', uploadMutler.any(),  addCategory);

module.exports = router;
