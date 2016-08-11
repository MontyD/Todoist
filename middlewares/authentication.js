'use strict';
var path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

var authentication = new LocalStrategy(
    function(username, password, done) {
        models.rooms.findOne({
            where: {
                'name': username
            },
            attributes: ['salt', 'password', 'id', 'name']
        }).then(function(room) {
            if (!room) {
                return done(null, false, {
                    message: 'Incorrect credentials.'
                });
            }
            bcrypt.hash(password, room.salt, function(err, hash) {
                if (err) {
                    done(null, false, err);
                }
                if (hash === room.password) {
                    return done(null, {
                        id: room.id,
                        name: room.name
                    });
                }
                return done(null, false, {
                    message: 'Incorrect credentials.'
                });
            });
        });
    }
);

module.exports = authentication;
