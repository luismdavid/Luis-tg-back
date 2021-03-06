const express = require('express');
const chatsController = require('../controllers/chatsController');
const loggedIn = require('../middleware/loggedIn');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const uuid = require('uuid/v4');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.user) {
      const ruta = path.join(__dirname, '../public/images/uploads/messages');
      return cb(null, ruta);
    }
    return cb(null, '');
  },
  filename: (req, file, cb, filename) => {
    cb(null, uuid() + path.extname(file.originalname));
  },
});

router
  .route('/')
  .post(loggedIn, chatsController.createNewChat)
  .put(loggedIn, chatsController.updateChat);

router
  .route('/message')
  .post(loggedIn, chatsController.sendNewMessage)
  .delete(loggedIn, chatsController.deleteChat);

router.post(
  '/message/upload',
  loggedIn,
  multer({ storage }).single('file'),
  chatsController.uploadImage
);

module.exports = router;
