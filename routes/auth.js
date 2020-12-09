var express = require('express');
const authController = require('../controllers/authController');
const loggedIn = require('../middleware/loggedIn');
var router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.user) {
      const ruta = path.join(__dirname, '../public/images/uploads/profile');
      return cb(null, ruta);
    }
    return cb(null, '');
  },
  filename: (req, file, cb, filename) => {
    cb(null, req.user._id + path.extname(file.originalname));
  },
});

router.get('', loggedIn, (req, res) => {
  res.status(200).json(req.user);
});

router.post('/verify', authController.sendVerifyCode);
router.post('/verifyCode', authController.verifyPhoneNumber);
router.post('/register', authController.registerUser);

router.post(
  '/users/uploadProfileImg',
  loggedIn,
  multer({ storage }).single('file'),
  authController.uploadProfileImg
);

router.get('/users', loggedIn, authController.searchByTerm);
router.put('/users', loggedIn, authController.updateInfo);

router.post('/login', authController.loginUser);

router.get('/logout', loggedIn, authController.logoutUser);

module.exports = router;
