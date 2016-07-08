'use strict';

function handleError(err, next) {
    console.error(err);
    var error;
    if (err.message === 'Validation error' && typeof err.errors[0].message === 'string') {
        error = new Error('Validation error: ' + err.errors[0].message);
    } else {
        error = new Error(err.message);
    }
    if (/Sequelize/gi.test(err.name) && /Validation/gi.test(err.message)) {
        error.status = 400;
    } else {
        error.status = err.status || 500;
    }
    next(error);
}

module.exports = handleError;
