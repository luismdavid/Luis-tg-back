const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
  title: {
    type: String,
    maxlength: 100,
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'Users',
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Messages'
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: false,
    default: ''
  }
});

module.exports = model('Chats', chatSchema);
