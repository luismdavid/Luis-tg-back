const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 500
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: false,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  profileImg: {
    type: String,
    default: process.env.HOST + '/images/profileDefault.jpg',
  },
});

module.exports = model('Users', userSchema);
