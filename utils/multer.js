const multer = require('multer')
const path = require('path')
console.log(__dirname)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "IMAGES")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))

  }
})
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg and .png format allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

module.exports = upload