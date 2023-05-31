const router = require('express').Router();
const { addCategory } = require('../controllers/category.controller');
// const { S3Client } = require('@aws-sdk/client-s3');
// const multer = require('multer');
// const multerS3 = require('multer-s3');

// const s3 = new S3Client()

// const upload = multer({
//     storage: multerS3({
//       s3: s3,
//       bucket: process.env.CYCLIC_BUCKET_NAME,
//       region: process.env.AWS_REGION,
//       acl: "public-read",
//       metadata: function (req, file, cb) {
//         cb(null, {fieldName: file.fieldname});
//       },
//       key: function (req, file, cb) {
//         cb(null, Date.now().toString())
//       }
//     })
//   })

router.post('/category', addCategory);

module.exports = router;
