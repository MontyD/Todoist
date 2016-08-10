'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passRoomAndUser = require(path.join(__dirname, '..', 'middlewares', 'passRoomAndUser'));

router.use('/rooms', require('./rooms.js'));

router.use('/tasks', require('./tasks.js'));

// render index or login if no user
router.get('/', passRoomAndUser, function(req, res) {
  if (req.user) {
    res.render('room');
  } else {
    res.render('Index');
  }
});

module.exports = router;
