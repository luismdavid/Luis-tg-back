const { Types } = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = {
  createNewChat: async (req, res) => {
    const { participants, title } = req.body;

    if (participants.length === 0 || !title) {
      return res.status(400).json({
        error: {
          message: 'Parametros incompletos.',
          status: 400,
          stack: 'Fetch user parameters [updateInfo]',
        },
      });
    }

    const chat = new Chat({ ...req.body });

    chat
      .save()
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: {
            message: err.messag,
            status: 500,
            stack: 'save user to mongoDB [createNewChat]',
          },
        });
      });
  },

  deleteChat: async (req, res) => {
    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({
        error: {
          message: 'Parametros incompletos.',
          status: 400,
          stack: 'delete Chat parameters [deleteChat]',
        },
      });
    }

    const newMsg = await Message.create({
      type: 'text',
      content: `${req.user.name} Ha salido del chat`,
      sentDate: new Date(),
      attachments: [],
      sender: Types.ObjectId(req.user._id)
    });

    console.log(newMsg);

    Chat.updateOne(
      { _id: Types.ObjectId(chatId) },
      {
        $pullAll: {
          participants: [Types.ObjectId(req.user._id)],
        },
        $push: {
          messages: newMsg._id,
        }
      }
    )
      .then(() => {
        res.status(201).json({
          message: 'Se ha eliminado el chat con exito'
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: {
            message: err.messag,
            status: 500,
            stack: 'save user to mongoDB [createNewChat]',
          },
        });
      });
  },

  uploadImage: async (req, res) => {
    return res.json({
      url: `${process.env.HOST}/images/uploads/messages/${req.file.filename}`,
    });
  },

  sendNewMessage: async (req, res) => {
    const { chatId } = req.query;

    if (!chatId) {
      return res.status(400).json({
        error: {
          message: 'Parametros incompletos.',
          status: 400,
          stack: 'Send new message [sendNewMessage]',
        },
      });
    }
    const newMSg = new Message(req.body);

    const doc = await newMSg.save();
    Chat.updateOne(
      {
        _id: Types.ObjectId(chatId),
      },
      {
        $push: {
          messages: doc._id,
        },
      }
    )
      .then(() => {
        res.status(201).json({
          message: 'Se ha enviado el mensaje correctamente',
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: {
            message: err.messag,
            status: 500,
            stack: 'save user to mongoDB [createNewChat]',
          },
        });
      });
  },
};
