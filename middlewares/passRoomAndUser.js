'use strict';

function passRoomAndUser(req, res, next) {

  //room is passed as req.room
    if (!req.room) {
        return next();
    }
    if (req.session.username) {
      res.locals.username = req.session.username;
    }
    res.locals.room = req.room;
    next();
}

module.exports = passRoomAndUser;
