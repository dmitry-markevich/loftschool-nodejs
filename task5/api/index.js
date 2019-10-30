const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/users');
const newsCtrl = require('../controllers/news');

function textToObject(req, res, next) {
    req.body = JSON.parse(req.body);
    next();
}

function isAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401).json({
            err: 'Unauthorized'
        })
    }
    next();
}

router.post('/login', textToObject, userCtrl.login);
router.post('/authFromToken', textToObject, userCtrl.authFromToken);
router.post('/saveUserImage/:id', isAuth, userCtrl.saveImage);

router.post('/saveNewUser', isAuth, (req, res, next) => {
    userCtrl.add(JSON.parse(req.body)).then(user => {
        req.logIn(user, err => {
            if (err) console.log({
                err: err.message
            });
        });
        res.status(201).json(user.getItem());
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.get('/getUsers', isAuth, (req, res, next) => {
    userCtrl.getList().then(users => {
        if (!users.length) {
            res.status(200).send('No entries');
        } else {
            res.json(users.map(user => {
                return user.getItem();
            }));
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.put('/updateUserPermission/:id', isAuth, (req, res, next) => {
    userCtrl.updatePermission(JSON.parse(req.body), req.params.id).then(result => {
        res.json(result);
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.put('/updateUser/:id', isAuth, (req, res, next) => {
    userCtrl.update(JSON.parse(req.body), req.params.id).then(user => {
        if (user) {
            res.json(user.getItem())
        } else {
            res.status(404).json({
                err: 'User not found'
            });
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.delete('/deleteUser/:id', isAuth, (req, res, next) => {
    userCtrl.delete(req.params.id).then(results => {
        if (results) {
            res.json(results);
        } else {
            res.status(404).json({
                err: 'User not found'
            });
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.get('/getNews', isAuth, (req, res, next) => {
    newsCtrl.getList().then(news => {
        if (!news.length) {
            res.status(200).send('No entries');
        } else {
            res.json(news);
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.post('/newNews', isAuth, (req, res, next) => {
    newsCtrl.add(JSON.parse(req.body)).then(news => {
        if (!news.length) {
            res.status(200).send('No entries');
        } else {
            res.json(news);
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.put('/updateNews/:id', isAuth, (req, res, next) => {
    newsCtrl.update(JSON.parse(req.body), req.params.id).then(news => {
        if (!news.length) {
            res.status(200).send('No entries');
        } else {
            res.json(news);
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

router.delete('/deleteNews/:id', isAuth, (req, res, next) => {
    newsCtrl.delete(req.params.id).then(news => {
        if (!news.length) {
            res.status(200).send('No entries');
        } else {
            res.json(news);
        }
    }).catch(err => {
        res.status(400).json({
            err: err.message
        });
    });
});

module.exports = router;
