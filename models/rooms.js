'use strict';

var bcrypt = require('bcrypt'),
    crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var room = sequelize.define('rooms', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                is: ['^[a-z0-9]+$', 'i'],
                len: {
                    args: [5, 20],
                    msg: 'Please enter a username consisting of only letters and numbers between five and twenty characters long'
                }
            }
        },
        theme: DataTypes.STRING,
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 40],
                    msg: 'Please enter a password between five and 40 characters long'
                }
            }
        },
        salt: DataTypes.STRING,
        adminPassword: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 40],
                    msg: 'Please enter a password between five and 40 characters long'
                }
            }
        },
        adminSalt: DataTypes.STRING
    }, {
        hooks: {
            beforeCreate: function(room, options, cb) {
                var done = 0;
                function complete() {
                    done++;
                    if (done === 2) {
                        cb(null, options);
                    }
                }
                bcrypt.genSalt(12, function(err, salt) {
                    if (err) {
                        return cb(err, options);
                    }
                    room.salt = salt;
                    bcrypt.hash(room.password, salt, function(err, hash) {
                        if (err) {
                            return cb(err, options);
                        }
                        room.password = hash;
                        room.salt = salt;
                        return complete();
                    });
                });
                bcrypt.genSalt(12, function(err, salt) {
                    if (err) {
                        return cb(err, options);
                    }
                    room.adminSalt = salt;
                    bcrypt.hash(room.adminPassword, salt, function(err, hash) {
                        if (err) {
                            return cb(err, options);
                        }
                        room.adminPassword = hash;
                        room.adminSalt = salt;
                        return complete();
                    });
                });
            }
        }
    });

    return room;
};
