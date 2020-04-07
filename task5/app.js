const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo')(session);

require('dotenv').config();
require('./db');

const app = express();

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const initChat = require('./config/chat');
initChat(io);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(
    session({
        store: new mongoStore({
            mongooseConnection: mongoose.connection
        }),
        secret: process.env.SECRET_KEY,
        key: 'session-key',
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 30 * 60 * 1000,
        },
        saveUninitialized: false,
        resave: true,
        ephemeral: true,
        rolling: true
    })
);

app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', require('./api'));

app.use(function (req, res, next) {
    res.render('index');
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

server.listen(process.env.PORT || 3001, function () {
    console.log('API started on port :' + server.address().port);
});
