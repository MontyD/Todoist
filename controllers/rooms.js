'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
    isAdmin = require(path.join(__dirname, '..', 'middlewares', 'isAdmin')),
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
          if (!info.noroom && info.room) {
            return res.redirect('/' + info.room + '?badpassword=true');
          }
          return res.redirect('/rooms/login?noroom=true');
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
    var username;
    if (req.session && req.session.username) {
      username = req.session.username;
    }
    res.render('security/login', {
        roomName: req.query.name,
        noRoom: req.query.noroom,
        username: username
    });
});

// Get - info about room logged into
router.get('/info', respondsToJSON, checkRoom, function(req, res, next) {
    res.io.to(req.room.name).emit('UserConnected', req.session.username + ' has joined!');
    return res.json({
        name: req.room.name,
        isAdmin: req.room.isAdmin,
        username: req.session.username
    });
});

// Post login - authenticate
router.post('/login', authenticateRoom);


// Post register
router.post('/new', function(req, res, next) {
    models.rooms.create(req.body).then(function(room) {
        models.todoLists.create({
            roomId: room.id
        }).then(function(todoList) {
            var userName = req.body.username;
            var roomName = req.body.name;
            req.body.name = userName;
            req.body.username = roomName;
            req.body.password = req.body.adminPassword;
            authenticateRoom(req, res, next);
        }).catch(function(err) {
            return handleError(err, next);
        });
    }).catch(function(error) {
        return handleError(error, next);
    });
});

// PUT update passcode
router.put('/update-passcode', respondsToJSON, checkRoom, isAdmin, function(req, res, next) {
    models.rooms.findById(req.room.id, {
        attributes: ['id']
    }).then(function(room) {
        // hash and salting done at model level
        room.update({
            passcode: req.body.passcode
        }).then(function(updatedRoom) {
            res.sendStatus(200);
        }).catch(function(err) {
            handleError(err, next);
        });
    }).catch(function(err) {
        handleError(err, next);
    });
});

// PUT update admin password
router.put('/update-admin-password', respondsToJSON, checkRoom, isAdmin, function(req, res, next) {
    models.rooms.findById(req.room.id, {
        attributes: ['id', 'adminSalt', 'adminPassword', 'passcode', 'passcodeSalt']
    }).then(function(room) {
        room.updateAdminPassword(req.body, function(err, confirm) {
            if (err) {
                return handleError(err, next);
            }
            return res.sendStatus(200);
        });
    }).catch(function(err) {
        handleError(err, next);
    });
});


// Get home - render user home admin
router.get('/new', function(req, res) {
    res.render('security/new');
});

router.get('/is-unique', respondsToJSON, function(req, res, next) {
    if (!req.query.name) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }
    models.rooms.find({
        where: {
            name: req.query.name
        },
        attributes: ['name']
    }).then(function(room) {
        if (room) {
            res.json(false);
        } else {
            res.json(true);
        }
    }).catch(function(err) {
        return handleError(err, next);
    });
});



router.delete('/', respondsToJSON, checkRoom, isAdmin, function(req, res, next) {
    models.rooms.findById(req.room.id, {
        attributes: ['id']
    }).then(function(room) {
        room.destroy().then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            handleError(err, next);
        });
    }).catch(function(err) {
        handleError(err, next);
    });
});

// DELETE session - echo log out across room session.
router.delete('/log-all-out', respondsToJSON, checkRoom, isAdmin, function(req, res, next) {
    res.io.to(req.room.name).emit('logAllOut', 'true');
    res.sendStatus(200);
});


module.exports = router;
