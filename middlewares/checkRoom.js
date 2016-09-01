'use strict';


function checkRoom(req, res, next) {

    // room gets passed as req.room
    if (req.room) {
        next();
    } else {
        var err = new Error('Please log in to view this page');
        err.status = 401;
        next(err);
    }
}

module.exports = checkRoom;
