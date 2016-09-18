'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
    isAdmin = require(path.join(__dirname, '..', 'middlewares', 'isAdmin')),
    passRoomAndUser = require(path.join(__dirname, '..', 'middlewares', 'passRoomAndUser'));

router.use('/rooms', require('./rooms.js'));

router.use('/tasks', respondsToJSON, checkRoom, require('./tasks.js'));

router.use('/todo-lists', respondsToJSON, checkRoom, require('./todo-lists.js'));

// render index or login if no user
router.get(['/', '/overview'], passRoomAndUser, function(req, res) {
  if (req.room) {
    res.render('room');
  } else {
    res.render('Index');
  }
});

// render faqs
router.get('/faq', function(req, res) {
  res.render('faq');
});


// render index or login if no user
router.get('/settings', checkRoom, passRoomAndUser, isAdmin,  function(req, res) {
  if (req.room) {
    res.render('room');
  } else {
    res.render('Index');
  }
});

// render login page for room
router.get('/:room', function(req, res) {
  if (req.room && !req.query.logout) {
      return res.redirect('/');
  }
  if (req.room) {
    req.logout();
  }
  var username;
  if (req.session && req.session.username) {
    username = req.session.username;
  }
  res.render('security/login', {
    room: req.params.room,
    username: username,
    badpassword: req.query.badpassword
  });
});


module.exports = router;
