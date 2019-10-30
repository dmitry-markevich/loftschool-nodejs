const newsModel = require('../models/news');

module.exports.getList = () => {
    return newsModel.find();
}

module.exports.add = (data) => {
    return new Promise((resolve, reject) => {
        const news = new newsModel({
            date: data.date,
            text: data.text,
            theme: data.theme,
            userId: data.userId
        });

        news.save().then(() => {
            newsModel.find().then(resolve).catch(reject);
        }).catch(reject);
    });
}

module.exports.update = (data, id) => {
    return new Promise((resolve, reject) => {
        const news = {
            text: data.text,
            theme: data.theme,
        }

        newsModel.findByIdAndUpdate({
            _id: id,
        }, {
            $set: news
        }).then(() => {
            newsModel.find().then(resolve).catch(reject);
        }).catch(reject);
    });
}

module.exports.delete = (id) => {
    return new Promise((resolve, reject) => {
        newsModel.findByIdAndRemove({
            _id: id,
        }).then(() => {
            newsModel.find().then(resolve).catch(reject);
        }).catch(reject);
    });
}
