'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passUser = require(path.join(__dirname, '..', 'middlewares', 'passUser'));

router.use('/users', require('./users.js'));

// render index
router.get('/', passUser, function(req, res) {
  if (req.user) {
    res.render('userHome');
  } else {
    res.render('login');
  }
});

module.exports = router;
