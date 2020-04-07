const mongoose = require('mongoose');
const schema = mongoose.Schema;

const newsSchema = new schema({
    theme: {
        type: String,
        required: [true, 'Укажите название новости']
    },
    date: {
        type: Date,
        required: [true, 'Укажите дату новости']
    },
    text: {
        type: String,
        required: [true, 'Укажите текст новости']
    },
    userId: {
        type: String,
        required: [true, 'Укажите автора новости']
    }
});

const newsModel = mongoose.model('news', newsSchema);

module.exports = newsModel;
