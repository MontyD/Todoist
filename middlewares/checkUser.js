'use strict';


function checkUser(req, res, next) {

    if (req.user) {
        next();
    } else {
        var err = new Error('Please log in to view this page');
        err.status = 401;
        next(err);
    }
}

module.exports = checkUser;
