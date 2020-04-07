const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const url = {
    development: process.env.DB_DEV,
    production: process.env.DB_PROD
}

mongoose.Promise = global.Promise;

mongoose.connect(url[env], {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose connection open ' + url[env]);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose connection disconnected app termination');
        process.exit(0);
    });
});
