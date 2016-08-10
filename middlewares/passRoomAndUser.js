'use strict';

function passRoomAndUser(req, res, next) {

  //room is passed as req.user
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
