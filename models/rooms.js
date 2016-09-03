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
                    args: [5, 20],
                    msg: 'Please enter a username consisting of only letters and numbers between five and twenty characters long'
                }
            }
        },
        theme: DataTypes.STRING,
        passcode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [5, 70],
                    msg: 'Please enter a password between five and seventy characters long'
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
                    msg: 'Please enter a password between five and seventy characters long'
                }
            }
        },
        adminSalt: DataTypes.STRING
    }, {
        hooks: {
            beforeCreate: function(room, options, cb) {
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
                  room.salt = salt;
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
              bcrypt.genSalt(12, function(err, salt) {
                  if (err) {
                      return error(err);
                  }
                  room.adminSalt = salt;
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
        }
    });
    return Room;
};
