'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkRoom = require(path.join(__dirname, '..', 'middlewares', 'checkRoom')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));

// GET ALL
router.get('/', respondsToJSON, checkRoom, function(req, res, next) {

    var start = req.query.start || 0;
    var limit = req.query.limit || 10;

    // FETCH ALL
    models.tasks.findAll({
        where: {
            roomId: req.user.id
        },
        order: [
            ['updatedAt'],
        ],
        limit: limit,
        offset: start
    }).then(function(tasks) {
        return res.json(tasks);
    }).catch(function(err) {
        return handleError(err, next);
    });

});


// GET one task by ID
router.get('/:taskID', respondsToJSON, checkRoom, function(req, res, next) {

    if (isNaN(req.params.taskID)) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        } else {
            if (task.roomId === req.user.id) {
                return res.json(task);
            } else {
                var error = new Error('Unauthorised');
                error.status = 403;
                return next(error);
            }
        }
    }).catch(function(err) {
        return handleError(err, next);
    });

});

// CREATE NEW
router.post('/', respondsToJSON, checkRoom, function(req, res, next) {

    if (!req.body.task) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }

    var task = req.body.task;

    task.roomId = req.user.id;

    task.username = req.session.username;

    models.tasks.create(task).then(function(newTask) {
        res.send(newTask);
    }).catch(function(err) {
        return handleError(err, next);
    });

});


// Update task by id
router.put('/:taskID', respondsToJSON, checkRoom, function(req, res, next) {

    if (isNaN(req.params.taskID) || !req.body.task) {
        var error = new Error('Bad put data');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        } else {
            if (task.roomId === req.room.id) {
                task.update(req.body.task).then(function(updatedTask) {
                    res.sendStatus(200);
                }).catch(function(err) {
                    return handleError(err, next);
                });
            } else {
                var error = new Error('Unauthorised');
                error.status = 403;
                return next(error);
            }
        }
    }).catch(function(err) {
        return handleError(err, next);
    });

});


// DELETE by ID
router.delete('/:taskID', function(req, res, next) {

    if (isNaN(req.params.taskID)) {
        var error = new Error('Bad put data');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        } else {
            if (task.roomId === req.room.id) {
                task.destroy().then(function(confirm) {
                    res.sendStatus(200);
                }).catch(function(err) {
                    return handleError(err, next);
                });
            } else {
                var error = new Error('Unauthorised');
                error.status = 403;
                return next(error);
            }
        }
    });

});


module.exports = router;
