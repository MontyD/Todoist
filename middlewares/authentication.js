'use strict';
var path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

var authentication = new LocalStrategy(
    function(name, password, done) {
      console.log(name);
      console.log(password);
        models.rooms.findOne({
            where: {
                'name': name
            },
            attributes: ['passcodeSalt', 'passcode', 'adminSalt', 'adminPassword', 'id', 'name']
        }).then(function(room) {
            if (!room) {
                return done(null, false, {
                    message: 'Room not found'
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
                                message: 'Incorrect password'
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
