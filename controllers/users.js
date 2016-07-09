'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkUser = require(path.join(__dirname, '..', 'middlewares', 'checkUser')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));
    
// Post login - authenticate
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', {
                badCredentials: true
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});


// Get - register page
router.get('/register', function(req, res, next) {

    req.logout();
    res.render('register');

});

// Post register - creates new user sends to login page with query string containing name and newAccount true, sets mailer to send verification email
router.post('/register', function(req, res, next) {
    if (req.body.password !== req.body.passwordConfirmation || !req.body.password || !req.body.passwordConfirmation) {
        return handleError({
            status: 400,
            message: 'Password not successfully confirmed'
        }, next);
    }
    models.users.create({
        username: req.body.username,
        fullName: req.body.fullName,
        password: req.body.password,
        email: req.body.email,
    }).then(function(user) {
        res.redirect('/users/login?newAccount=true&username=' + user.username);
    }).catch(function(error) {
        handleError(error, next);
    });
});

// Get home - render user home admin
router.get('/home', checkUser, function(req, res) {

    res.render('userHome');

});

// Get - logout
router.get('/logout', function(req, res, next) {

    req.logout();

    res.redirect('/');

});


module.exports = router;
