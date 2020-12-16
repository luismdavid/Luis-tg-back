require('dotenv').config();
const express = require('express');
const session = require('express-session');
const logger = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const passportSocketIo = require('passport.socketio');

require('./database');

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: [
      'Authorization',
      'X-Requested-With',
      'X-HTTP-Method-Override',
      'Content-Type',
      'Accept',
    ],
    credentials: true,
  }
});

exports.io = io;

const sessionStore = new MongoStore({
  mongooseConnection: require('mongoose').connection,
});

// app.use(cors({
//   credentials: true
// }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    key: 'ai_user',
    saveUninitialized: true,
    store: sessionStore,
    resave: true,
  })
);
// io.use(
//   passportSocketIo.authorize({
//     key: 'ai_user',
//     secret: process.env.SECRET_KEY,
//     store: sessionStore,
//   })
// );
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  );
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
});

const passportMiddleware = require('./middleware/passport');

app.use(passport.initialize());
app.use(passport.session());
passport.use(passportMiddleware);

require('./chat');

//ROUTES
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const User = require('./models/User');

app.use('/auth', authRoutes);
app.use('/chats', chatRoutes);
//
server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on http://localhost:3000');
});

module.exports = app;
