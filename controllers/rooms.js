'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));

  // Get - register page
  router.get('/login', function(req, res, next) {
      req.logout();
      res.render('security/login', {name: req.query.name});

  });

// Post login - authenticate
router.post('/login', function(req, res, next) {
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
});


// Post register
router.post('/new', function(req, res, next) {
    if (req.body.password !== req.body.confirm || !req.body.password || !req.body.confirm) {
        return res.render('security/new', {error: {message: 'Password confirmation incorrect.'}});
    }
    models.rooms.create(req.body).then(function(room) {
        return res.redirect('/rooms/login?name=' + room.name);
    }).catch(function(error) {
        return res.render('security/new', {error: {message: error.errors[0].message}});
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
