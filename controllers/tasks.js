'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));

// GET ALL
router.get('/', function(req, res, next) {

    var start = parseInt(req.query.start) || 0;
    var limit = parseInt(req.query.limit) || 10;
    var todoList = parseInt(req.query.todoList);
    var query = {
        roomId: req.room.id
    };
    if (req.query.status) {
        query.status = req.query.status;
    }
    if (todoList) {
      query.todoListId = todoList;
    }

    // FETCH ALL
    models.tasks.findAll({
        where: query,
        order: [
            ['createdAt', 'DESC'],
        ],
        limit: limit,
        offset: start
    }).then(function(tasks) {
        return res.json({
            tasks: tasks
        });
    }).catch(function(err) {
        return handleError(err, next);
    });

});

// GET count of tasks - status Todo
router.get('/todo-count', function(req, res, next) {

    var reqRoomId = req.room.id;

    models.tasks.count({
        where: {
            status: 'Todo',
            roomId: reqRoomId
        }
    }).then(function(c) {
        return res.json({
            count: c
        });
    }).catch(function(err) {
        return handleError(err, next);
    });

});

router.get('/completed-count', function(req, res, next) {

    var reqRoomId = req.room.id;

    models.tasks.count({
        where: {
            status: 'Complete',
            roomId: reqRoomId
        }
    }).then(function(c) {
        return res.json({
            count: c
        });
    }).catch(function(err) {
        return handleError(err, next);
    });

});

router.get('/completed-last-day', function(req, res, next) {

    var reqRoomId = req.room.id;
    var today = new Date();

    models.tasks.count({
        where: {
            status: 'Complete',
            roomId: reqRoomId,
            updatedAt: {
                $gt: new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
            }
        }
    }).then(function(c) {
        if (!c) {
            return res.json({
                count: 0
            });
        }
        return res.json({
            count: c
        });
    }).catch(function(err) {
        return handleError(err, next);
    });

});

router.get('/completed-last-week', function(req, res, next) {

    var reqRoomId = req.room.id;
    var today = new Date();

    models.tasks.findAll({
        attributes: ['updatedAt'],
        where: {
            status: 'Complete',
            roomId: reqRoomId,
            updatedAt: {
                $gt: new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 7)
            }
        }
    }).then(function(data) {
        return res.json(data);
    }).catch(function(err) {
        return handleError(err, next);
    });

});

// GET one task by ID
router.get('/:taskID', function(req, res, next) {

    if (isNaN(req.params.taskID)) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        } else {
            if (task.roomId === req.room.id) {
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
router.post('/', function(req, res, next) {

    if (!req.body.task) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }

    var task = req.body.task;

    task.roomId = req.room.id;

    task.username = req.session.username;

    models.tasks.create(task).then(function(newTask) {
        res.io.to(req.room.name).emit('NewTask', {
            task: newTask,
            username: req.session.username,
            hash: req.body.hash
        });
        res.send(newTask);
    }).catch(function(err) {
        return handleError(err, next);
    });

});

// Update task by id
router.put('/:taskID', function(req, res, next) {

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
                    res.io.to(req.room.name).emit('UpdatedTask', {
                        task: updatedTask,
                        username: req.session.username,
                        hash: req.body.hash
                    });
                    res.json(updatedTask);
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


// DELETE all completed - by room id
router.delete('/delete-completed', function(req, res, next) {
    models.tasks.destroy({
        where: {
            roomId: req.room.id,
            status: 'Complete'
        }
    }).then(function() {
        res.io.to(req.room.name).emit('DeletedAllComplete', {
            username: req.session.username,
            hash: req.query.hash
        });
        return res.sendStatus(200);
    }).catch(function(err) {
        handleError(err, next);
    });
});



// DELETE by ID
router.delete('/:taskID', function(req, res, next) {

    if (isNaN(req.params.taskID)) {
        var error = new Error('Bad request');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        }
        if (task.roomId === req.room.id) {
            task.destroy().then(function(confirm) {
                res.io.to(req.room.name).emit('DeletedTask', {
                    task: task,
                    username: req.session.username,
                    hash: req.query.hash
                });
                res.sendStatus(200);
            }).catch(function(err) {
                return handleError(err, next);
            });
        } else {
            var error = new Error('Unauthorised');
            error.status = 403;
            return next(error);
        }
    }).catch(function(err) {
        return handleError(err, next);
    });

});


module.exports = router;
