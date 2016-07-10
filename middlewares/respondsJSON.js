'use strict';

var path = require('path');

function respondsToJSON(req, res, next) {

    if (/json/gi.test(req.get('accept'))) {
        next();
    } else {
        var err = new Error('Go away please');
        err.status = 403;
        next(err);
    }
}

module.exports = respondsToJSON;
