const multer = require('multer');
const config = require('../config');

module.exports = multer({ dest: config.uploadDir, fileFilter: singleUpload });

function singleUpload(req, file, cb) {
  if (!req.uploaded) {
    req.uploaded = 1;
    return cb(null, true);
  }

  cb(null, false);
}