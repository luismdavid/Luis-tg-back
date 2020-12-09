const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  type: String,
  content: String,
  sentDate: Date,
  attachments: [
    {
      url: {
        type: String,
      },
      type: {
        type: String,
      },
    },
  ],
});

module.exports = model('Messages', messageSchema);
