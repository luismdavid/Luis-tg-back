const { io } = require('./app');
const Chat = require('./models/Chat');
const { Types } = require('mongoose');
const Message = require('./models/Message');

io.on('connection', (socket) => {
  console.log('connected to Socket');
  socket.on('get-chats', async ({ userId }) => {
    const results = await Chat.find({
      participants: Types.ObjectId(userId),
    })
      .populate('participants', '_id name phoneNumber profileImg')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'Users',
        },
      });
    socket.emit('chats-changed', results);
  });

  socket.on('join-chat', async ({ chatId, userId }) => {
    const changeStream = Chat.watch([{
      $match: {
        'documentKey._id': Types.ObjectId(chatId)
      }
    }]);
    changeStream.on('change', async (change) => {
      console.log('new message being sent');
      if (
        change.operationType === 'update' &&
        change.updateDescription.updatedFields
      ) {
        for (const key in change.updateDescription.updatedFields) {
          const element = change.updateDescription.updatedFields[key];
          if (key.startsWith('messages')) {
            const message = await Message.findById(element).populate('sender', '_id profileImg name phoneNumber');
            io.to(socket.id).emit('new-message', message);
          }
        }
      }
      //io.in(chatId).emit('chat-changed', change);
    });
    const chat = await Chat.findById(chatId)
      .populate('participants', '_id name phoneNumber profileImg')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          model: 'Users',
        },
      });
    io.to(socket.id).emit('chat-changed', chat);
  });
});
