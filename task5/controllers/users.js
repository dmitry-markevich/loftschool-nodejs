const userModel = require('../models/users');
const passport = require('passport');
const formidable = require('formidable');
const jimp = require('jimp');
const uuid = require('uuid/v4');
const path = require('path');
const fs = require('fs');

module.exports.add = (data) => {
    const user = new userModel({
        username: data.username,
        permission: JSON.stringify(data.permission),
        firstName: data.firstName,
        surName: data.surName,
        middleName: data.middleName,
        image: data.img
    });

    user.setPassword(data.password);
    user.setToken(uuid());

    return user.save();
};

module.exports.getList = () => {
    return userModel.find();
};

module.exports.updatePermission = (data, id) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({
            _id: id
        }).then(user => {
            if (!user) {
                reject({
                    message: 'User not found'
                });
            }

            user.permission = JSON.stringify({
                chat: {
                    ...JSON.parse(user.permission).chat,
                    ...data.permission.chat
                },
                news: {
                    ...JSON.parse(user.permission).news,
                    ...data.permission.news
                },
                setting: {
                    ...JSON.parse(user.permission).setting,
                    ...data.permission.setting
                }
            });

            user.save().then(user => {
                resolve({
                    permissionId: id,
                    permission: JSON.parse(user.permission)
                });
            }).catch(reject);
        }).catch(reject);
    });
}

module.exports.update = (data, id) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({
            _id: id
        }).then(user => {
            if (!user) {
                reject({
                    message: 'User not found'
                });
            }

            const fields = ['username', 'firstName', 'surName', 'middleName'];
            fields.forEach(field => {
                if (data[field]) {
                    user[field] = data[field];
                }
            });

            if (data.oldPassword && user.validPassword(data.oldPassword)) {
                user.setPassword(data.password);
            }

            user.save().then(resolve).catch(reject);
        }).catch(reject);
    });
}

module.exports.delete = id => {
    return userModel.findByIdAndRemove({
        _id: id
    });
}

module.exports.saveImage = (req, res, next) => {
    let form = new formidable.IncomingForm();
    let upload = path.join('./public', 'uploads');

    if (!fs.existsSync(upload)) {
        fs.mkdirSync(upload);
    }

    form.uploadDir = path.join(process.cwd(), upload);

    form.parse(req, function (err, fields, files) {
        if (err) {
            res.status(400).json({
                err: err.message
            });
        }

        const fileName = path.join(upload, Math.random().toString(36).substr(2, 8) + '.' + files[req.params.id].name.split('.').pop());

        fs.rename(files[req.params.id].path, fileName, function (err) {
            if (err) {
                res.status(400).json({
                    err: err.message
                });
            }

            jimp.read(fileName, (err, img) => {
                if (err) {
                    res.status(400).json({
                        err: err.message
                    });
                }

                img.cover(256, 256).quality(60).write(fileName, err => {
                    if (err) {
                        res.status(400).json({
                            err: err.message
                        });
                    }

                    let dir = fileName.substr(fileName.indexOf('\\')).replace(/(\\\\|\\)/g, '/');

                    userModel.findByIdAndUpdate({
                        _id: req.params.id
                    }, {
                        $set: {
                            image: dir
                        }
                    }, {
                        new: true
                    }).then(user => {
                        if (!user) {
                            res.status(404).json({
                                err: 'User not found'
                            });
                        }
                        res.json({
                            path: user.image
                        });
                    }).catch(err => {
                        res.status(400).json({
                            err: err.message
                        });
                    });
                });
            });
        });
    });
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.status(401).json({
                err: err.message
            });
        }
        if (user) {
            req.logIn(user, err => {
                if (err) res.status(403).json({
                    err: err.message
                });
                if (req.body.remembered) {
                    const token = uuid();
                    user.setToken(token);
                    user.save().then(user => {
                        res.cookie('access_token', token, {
                            maxAge: 7 * 60 * 60 * 1000,
                            path: '/'
                        });
                        res.json(user.getItem());
                    });
                } else {
                    res.json(user.getItem());
                }
            });
        } else {
            res.status(403).json({
                err: 'Not authenticated'
            });
        }
    })(req, res, next);
}

module.exports.authFromToken = (req, res, next) => {
    const token = req.body.access_token;
    if (!!token) {
        userModel.findOne({
            access_token: token
        }).then(user => {
            if (user) {
                req.logIn(user, err => {
                    if (err) next(err);
                });
                res.status(201).json(user.getItem());
            }
        });
    } else {
        res.status(403);
    }
}
