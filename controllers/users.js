'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    mailer = require(path.join(__dirname, '..', 'mailer')),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkUser = require(path.join(__dirname, '..', 'middlewares', 'checkUser')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));
// Get - login
router.get('/login', function(req, res, next) {

    req.logout();

    var locals = {};

    if (req.query.newAccount) {
        locals.newAccount = true;
    }

    if (req.query.username) {
        locals.temporaryUserName = req.query.username;
    }

    res.render('login', locals);

});

// Post login - authenticate
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login'
}), function(req, res, next) {
    var redirect = req.body.originalURL || '/users/home';
    res.redirect(redirect);
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
        mailer.verificationEmail(user.email, user.firstName, user.username + '/verifyemail?hash=' + user.emailVerificationHash);
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
