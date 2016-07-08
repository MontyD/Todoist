'use strict';

function passUser(req, res, next) {
    if (!req.user) {
        return next();
    }
    res.locals.user = req.user;
    next();
}

module.exports = passUser;
