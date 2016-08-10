'use strict';

function passRoomAndUser(req, res, next) {
    if (!req.user) {
        return next();
    }
    if (req.session.username) {
      res.locals.username = req.session.username;
    }
    res.locals.room = req.user;
    next();
}

module.exports = passRoomAndUser;
