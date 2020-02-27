const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const morgan = require('morgan');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const sequelize = require('./util/database');
const socketServer = require('./util/socketServer');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const User = require('./model/user');
const PrivateChat = require('./model/private-chat');
const ChatMessage = require('./model/chat-message');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const privateChatRoutes = require('./routes/private-chat');
const usersRoutes = require('./routes/users');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static('public'));

app.use(cookieParser());
app.use(
    session({
        secret: 'my secret',
        store: new SequelizeStore({
            db: sequelize,
        }),
        resave: false, // we support the touch method so per the express-session docs this should be set to false
        saveUninitialized: false,
        expiration: 24 * 60 * 60 * 1000,
    })
);

app.use(morgan('dev'));

app.use(authRoutes);
app.use('/chat', chatRoutes);
app.use('/profile', profileRoutes);
app.use('/private-chat', privateChatRoutes);
app.use('/users', usersRoutes);

// relations
PrivateChat.belongsTo(User, { as: 'chatpartnerone', foreignKey: 'chatpartnerone_Id' });
PrivateChat.belongsTo(User, { as: 'chatpartnertwo', foreignKey: 'chatpartnertwo_Id' });

ChatMessage.belongsTo(User, { as: 'sender', foreignKey: 'sender_Id' });
ChatMessage.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_Id' });
ChatMessage.belongsTo(PrivateChat, { as: 'chat', foreignKey: 'chat_Id' });

sequelize
    // .sync({ force: true })
    .sync()
    .then(() => {
        socketServer.initServer(io, http, app);
    })
    .catch(err => {
        console.log(err);
    });
