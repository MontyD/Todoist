'use strict';

var bcrypt = require('bcrypt'),
    crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var Room = sequelize.define('rooms', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                is: ['^[a-z0-9]+$', 'i'],
                len: {
                    args: [4, 20],
                    msg: 'Please enter a username consisting of only letters and numbers between five and twenty characters long'
                },
                notIn: [['rooms', 'tasks', 'todo-lists', 'settings', 'overview']]
            }
        },
        theme: DataTypes.STRING,
        passcode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 70],
                    msg: 'Please enter a passcode between five and seventy characters long'
                }
            }
        },
        passcodeSalt: DataTypes.STRING,
        adminPassword: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 70],
                    msg: 'Please enter an admin password between five and seventy characters long'
                }
            }
        },
        adminSalt: DataTypes.STRING
    }, {
        hooks: {
            beforeCreate: function(room, options, cb) {
                if (room.passcode === room.adminPassword) {
                    cb({
                        message: 'Validation error: Passcode cannot be the same as the admin password',
                        name: 'Sequelize'
                    }, options);
                }
                room.generatePasswordHashes(room, options, cb);
            },
            beforeUpdate: function(room, options, cb) {
                room.generatePasswordHashes(room, options, cb);
            }
        },
        instanceMethods: {
            generatePasswordHashes: function(room, options, cb) {
                var done = 0;

                function complete() {
                    done--;
                    if (done === 0) {
                        return cb(null, options);
                    }
                }

                function error(err) {
                    return cb(err, options);
                }
                if (options.fields.indexOf('passcode') > -1) {
                    done++;
                    this.generatePassCodeHash(room, complete, error);
                }
                if (options.fields.indexOf('adminPassword') > -1) {
                    done++;
                    this.generateAdminPasswordHash(room, complete, error);
                }
            },
            generatePassCodeHash: function(room, complete, error) {
                bcrypt.genSalt(12, function(err, salt) {
                    if (err) {
                        return error(err);
                    }
                    bcrypt.hash(room.passcode, salt, function(err, hash) {
                        if (err) {
                            return error(err);
                        }
                        room.passcode = hash;
                        room.passcodeSalt = salt;
                        return complete();
                    });
                });
            },
            generateAdminPasswordHash: function(room, complete, error) {
                // compare with passcode first - exists
                if (room.passcode && room.passcodeSalt) {
                    bcrypt.hash(room.adminPassword, room.passcodeSalt, function(err, hash) {
                        if (err) {
                            return error(err);
                        }
                        if (hash === room.passcode) {
                            return error({
                                message: 'Validation error: Admin password cannot be the same as room passcode'
                            });
                        }
                        bcrypt.genSalt(12, function(err, salt) {
                            if (err) {
                                return error(err);
                            }
                            bcrypt.hash(room.adminPassword, salt, function(err, hash) {
                                if (err) {
                                    return error(err);
                                }
                                room.adminPassword = hash;
                                room.adminSalt = salt;
                                return complete();
                            });
                        });
                    });
                } else {
                    bcrypt.genSalt(12, function(err, salt) {
                        if (err) {
                            return error(err);
                        }
                        bcrypt.hash(room.adminPassword, salt, function(err, hash) {
                            if (err) {
                                return error(err);
                            }
                            room.adminPassword = hash;
                            room.adminSalt = salt;
                            return complete();
                        });
                    });
                }
            },
            updateAdminPassword: function(passwords, cb) {
                if (!passwords || passwords.new !== passwords.confirm) {
                    return cb({
                        message: 'Password confirmation does not match',
                        status: 400
                    }, false);
                }
                var room = this;
                bcrypt.hash(passwords.old, room.adminSalt, function(err, hash) {
                    if (err) {
                        return cb(err, false);
                    }
                    if (hash !== room.adminPassword) {
                        return cb({
                            message: 'Current password incorrect',
                            status: 400
                        }, false);
                    }
                    room.update({
                        adminPassword: passwords.new
                    }).then(function(updated) {
                        return cb(null, true);
                    }).catch(function(err) {
                        return cb(err, false);
                    });
                });
            }
        }
    });
    return Room;
};
