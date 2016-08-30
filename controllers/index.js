'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
    passRoomAndUser = require(path.join(__dirname, '..', 'middlewares', 'passRoomAndUser'));

router.use('/rooms', require('./rooms.js'));

router.use('/tasks', respondsToJSON, checkRoom, require('./tasks.js'));

// render index or login if no user
router.get(['/', '/overview', '/settings'], passRoomAndUser, function(req, res) {
  if (req.user) {
    res.render('room');
  } else {
    res.render('Index');
  }
});

module.exports = router;
