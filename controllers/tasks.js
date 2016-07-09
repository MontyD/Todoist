'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkUser = require(path.join(__dirname, '..', 'middlewares', 'checkUser')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));


router.get('/', respondsToJSON, checkUser, function(req, res, next) {
  res.send('tasks');
});


module.exports = router;
