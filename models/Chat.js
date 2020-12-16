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
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Messages'
  }],
  type: {
    type: String,
    default: 'private'
  },
  image: {
    type: String,
    required: false,
    default: ''
  }
});

module.exports = model('Chats', chatSchema);
