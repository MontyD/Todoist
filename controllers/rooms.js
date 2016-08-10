'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
    passRoomAndUser = require(path.join(__dirname, '..', 'middlewares', 'passRoomAndUser')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));


// Passport auth
function authenticateRoom(req, res, next) {
    if (req.body.name) {
        req.session.username = req.body.name;
    }
    passport.authenticate('local', function(err, room, info) {
        if (err) {
            return next(err);
        }
        if (!room) {
            return res.render('security/login', {
                badCredentials: true,
                originalURL: req.body.originalURL
            });
        }
        req.logIn(room, function(err) {
            if (err) {
                return next(err);
            }
            var redirect = req.body.originalURL || '/';
            return res.redirect(redirect);
        });
    })(req, res, next);
}

// Get - register page
router.get('/login', function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.render('security/login', {
        roomName: req.query.name
    });
});

// Post login - authenticate
router.post('/login', authenticateRoom);


// Post register
router.post('/new', function(req, res, next) {
    if (req.body.password !== req.body.confirm || !req.body.password || !req.body.confirm) {
        return res.render('security/new', {
            error: {
                message: 'Password confirmation incorrect.'
            }
        });
    }
    var newRoom = req.body;
    newRoom.name = req.body.username;
    models.rooms.create(req.body).then(function(room) {
        authenticateRoom(req, res, next);
    }).catch(function(error) {
      return handleError(error, next);
    });
});

// Get home - render user home admin
router.get('/new', function(req, res) {

    res.render('security/new');

});

// Get - logout
router.get('/logout', function(req, res, next) {

    req.logout();

    res.redirect('/');

});


module.exports = router;
