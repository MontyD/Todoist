'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkUser = require(path.join(__dirname, '..', 'middlewares', 'checkUser')),
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


// Post register - creates new user sends to login page with query string containing name and newAccount true, sets mailer to send verification email
router.post('/new', function(req, res, next) {
    if (req.body.password !== req.body.confirm || !req.body.password || !req.body.confirm) {
        return res.render('security/new', {error: {message: 'Password confirmation incorrect.'}});
    }
    models.rooms.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
    }).then(function(room) {
        res.redirect('/rooms/login?name=' + room.name);
    }).catch(function(error) {
        console.error(error);
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
