const router = require('express').Router();
const multer = require("multer");
const { checkServer, upload } = require('../controllers/app.controller');

const uploadMutler = multer({dest: 'files/'});

router.get('/app', checkServer);
router.post('/upload', uploadMutler.any(), upload);

module.exports = router;
