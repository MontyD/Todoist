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
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: {
                    msg: 'Please enter a valid email address'
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
        salt: DataTypes.STRING
    }, {
        hooks: {
            beforeCreate: function(room, options, cb) {
              room.name = String(room.name).toLowerCase();
                bcrypt.genSalt(12, function(err, salt) {
                    if (err) {
                        cb(err, options);
                    }
                    room.salt = salt;
                    bcrypt.hash(room.password, salt, function(err, hash) {
                        if (err) {
                            cb(err, options);
                        }
                        room.password = hash;
                        room.salt = salt;
                        return cb(null, options);
                    });
                });
            }
        }
    });

    return room;
};
