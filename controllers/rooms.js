'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    passport = require('passport'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
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
}

// Get - register page
router.get('/login', function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.render('security/login', {
        roomName: req.query.name
    });
});

// Get - info about room logged into
router.get('/info', respondsToJSON, checkRoom, function(req, res, next) {
    return res.json({
        roomName: req.room.name,
        isAdmin: req.room.isAdmin,
        username: req.session.username
    });
});

// Post login - authenticate
router.post('/login', authenticateRoom);


// Post register
router.post('/new', function(req, res, next) {
    models.rooms.create(req.body).then(function(room) {
        authenticateRoom(req, res, next);
    }).catch(function(error) {
        return handleError(error, next);
    });
});

// PUT update passcode
router.put('/update-passcode', respondsToJSON, checkRoom, function(req, res, next) {
    models.rooms.findById(req.room.id).then(function(room) {
        // hash and salting done at model level
        room.update({
            password: req.body.password
        }).then(function(updatedRoom) {
            res.sendStatus(200);
        }).catch(function(err) {
            handleError(err, next);
        });
    }).catch(function(err) {
        handleError(err, next);
    });
});

// PUT update passcode
router.put('/update-passcode', respondsToJSON, checkRoom, function(req, res, next) {
    models.rooms.findById(req.room.id, {
        attributes: ['id']
    }).then(function(room) {
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
router.put('/update-admin-password', respondsToJSON, checkRoom, function(req, res, next) {
    models.rooms.findById(req.room.id, {
        attributes: ['id', 'adminSalt', 'adminPassword']
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

router.delete('/log-all-out', respondsToJSON, checkRoom, function(req, res, next) {
    res.io.to(req.room.name).emit('logAllOut', 'true');
    res.sendStatus(200);
});


module.exports = router;
