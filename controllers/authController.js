const bcrypt = require('bcryptjs');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID } = process.env;
const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../configuration/config');

function createToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
    },
    config.jwtSecret,
    {
      expiresIn: 20000000,
    }
  );
}

module.exports = {
  registerUser: async (req, res) => {
    const user = new User(req.body);
    if (!user.email || !user.password || !user.name || !user.phoneNumber) {
      res.status(400).json({
        error:
          'No ha ingresado los datos correctamente, por favor intente de nuevo.',
      });
      return;
    }
    const exists = await User.findOne({
      email: user.email,
    });
    if (exists) {
      res.status(401).json({
        error: {
          message:
            'Ya existe un usuario con el correo/identificacion ingresado.',
          status: 401,
          stack: 'register user function [registerUser]',
        },
      });
      return;
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        user
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
                stack: 'save user to mongoDB [registerUser]',
              },
            });
          });
      });
    });
  },

  updateInfo: async (req, res) => {
    const { name, email, phoneNumber } = req.body;
    if (!name || !phoneNumber || !email) {
      return res.status(400).json({
        error: {
          message: 'Parametros incompletos.',
          status: 400,
          stack: 'Fetch user parameters [updateInfo]',
        },
      });
    }
    data = {
      ...req.user._doc,
      ...req.body,
    };

    User.findByIdAndUpdate(req.user._id, data, {
      new: true,
    })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'nose',
          },
        })
      );
  },

  loginUser: async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        error: {
          message: 'Bad request',
        },
      });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Correo/contrasena invalidos.',
        },
      });
    }

    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (result)
        return res.status(200).json({
          token: createToken(user),
          user,
        });
      else
        return res.status(401).json({
          error: {
            message: 'Correo/contrasena invalidos.',
          },
        });
    });
  },

  sendVerifyCode: async (req, res) => {
    let verificationRequest;
    try {
      verificationRequest = await twilio.verify
        .services(VERIFICATION_SID)
        .verifications.create({ to: req.body.phoneNumber, channel: 'sms' });
    } catch (e) {
      return res.status(500).send(e);
    }

    console.log(verificationRequest);
    return res.status(200).json({
      message: 'Se ha enviado el codigo de verificacion al numero ingresado.',
    });
  },

  verifyPhoneNumber: async (req, res) => {
    const { verificationCode: code } = req.body;
    let verificationResult;

    try {
      verificationResult = await twilio.verify
        .services(VERIFICATION_SID)
        .verificationChecks.create({ code, to: req.body.phoneNumber });

      if (verificationResult.status !== 'approved') {
        return res.status(403).json({
          message: 'La verificacion de numero de telefono ha fallado',
        });
      }
      return res.status(200).json({
        message: verificationResult.status,
      });
    } catch (e) {
      console.log(verificationResult);
      return res.status(403).json({
        message: 'La verificacion de numero de telefono ha fallado.',
      });
    }
  },

  uploadProfileImg: async (req, res) => {
    const user = await User.findById(req.user._id);

    user
      .updateOne({
        profileImg: `${process.env.HOST}/images/uploads/profile/${req.file.filename}`,
      })
      .then(() => {
        res.status(200).json(user);
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'nose',
          },
        })
      );
  },

  searchByTerm: async (req, res) => {
    const { term } = req.query;
    const result = await User.aggregate([
      {
        $match: {
          $or: [
            {
              name: {
                $regex: term,
                $options: 'i',
              },
            },
            {
              phoneNumber: {
                $regex: term,
                $options: 'i',
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json(result);
  },

  logoutUser: (req, res) => {
    req.logout();
    return res.status(200).json(null);
  },
};
