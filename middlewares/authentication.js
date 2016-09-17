'use strict';
var path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

var authentication = new LocalStrategy(
    function(name, password, done) {
        models.rooms.findOne({
            where: {
                'name': name
            },
            attributes: ['passcodeSalt', 'passcode', 'adminSalt', 'adminPassword', 'id', 'name']
        }).then(function(room) {
            if (room === null) {
                return done(null, false, {
                    noroom: true
                });
            }
            bcrypt.hash(password, room.passcodeSalt, function(err, hash) {
                if (err) {
                    return done(null, false, err);
                }
                if (hash === room.passcode) {
                    return done(null, {
                        id: room.id,
                        name: room.name,
                        isAdmin: false
                    });
                // check if admin user
                } else {
                    bcrypt.hash(password, room.adminSalt, function(err, adminHash) {
                        if (err) {
                            return done(null, false, err);
                        }
                        if (adminHash === room.adminPassword) {
                            return done(null, {
                                id: room.id,
                                name: room.name,
                                isAdmin: true
                            });
                        } else {
                            return done(null, false, {
                                room: room.name
                            });
                        }
                    });
                }
            });
        }).catch(function(err) {
          return done(null, false, err);
        });
    }
);

module.exports = authentication;
