'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    sequelize = require('sequelize'),
    models = require(path.join(__dirname, '..', 'models')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));



router.get('/', function(req, res, next) {

    var start = parseInt(req.query.start) || 0;
    var limit = parseInt(req.query.limit) || 10;

    // FETCH ALL
    models.todoLists.findAll({
        where: {
            roomId: req.room.id
        },
        limit: limit,
        offset: start,
        include: [{
            model: models.tasks,
            where: {
                status: 'Todo'
            },
            order: [
                ['createdAt', 'DESC'],
            ],
            required: false
        }],
        order: [
            [
                'createdAt',
                'DESC',
            ],
            [{
                    model: models.tasks,
                },
                'createdAt',
                'DESC',
            ],
        ],
    }).then(function(lists) {
        return res.json(lists);
    }).catch(function(err) {
        return handleError(err, next);
    });

});

router.get('/count-all', function(req, res, next) {
    models.todoLists.count({
        where: {
            roomId: req.room.id
        }
    }).then(function(c) {
        return res.json({
            count: c
        });
    }).catch(function(err) {
        return handleError(err, next);
    });
});

router.get('/:ID', function(req, res, next) {

    models.todoLists.findById(req.params.ID).then(function(list) {
        if (req.room.id !== list.roomId) {
            var error = new Error('Unauthorised');
            error.status = 403;
            return next(error);
        }
        return res.json(list);
    }).catch(function(err) {
        return handleError(err, next);
    });

});

router.post('/', function(req, res, next) {
    var newList = {
        name: req.body.name || '',
        roomId: req.room.id
    };
    models.todoLists.create(newList).then(function(createdList) {
        res.io.to(req.room.name).emit('NewTodoList', {
            list: createdList,
            username: req.session.username,
            hash: req.body.hash
        });
        return res.json(createdList);
    }).catch(function(err) {
        return handleError(err, next);
    });

});

router.put('/:ID', function(req, res, next) {
    if (isNaN(req.params.ID) || !req.body.todoList) {
        var error = new Error('Bad put data');
        error.status = 400;
        return next(error);
    }

    models.todoLists.findById(req.params.ID).then(function(list) {
        if (!list) {
            return next();
        } else {
            if (list.roomId !== req.room.id) {
                var error = new Error('Unauthorised');
                error.status = 403;
                return next(error);
            }
            list.update(req.body.todoList).then(function(updatedList) {
                res.io.to(req.room.name).emit('UpdatedList', {
                    list: updatedList,
                    username: req.session.username,
                    hash: req.body.hash
                });
                res.json(updatedList);
            }).catch(function(err) {
                return handleError(err, next);
            });
        }
    }).catch(function(err) {
        return handleError(err, next);
    });

});

// DELETE all completed - by room id
router.delete('/:ID', function(req, res, next) {
    if (isNaN(req.params.ID)) {
        var error = new Error('Bad request');
        error.status = 400;
        return next(error);
    }

    models.todoLists.findById(req.params.ID).then(function(list) {
        if (!list) {
            return next();
        } else {
            if (list.roomId !== req.room.id) {
                var error = new Error('Unauthorised');
                error.status = 403;
                return next(error);
            }
            list.destroy().then(function() {
                res.io.to(req.room.name).emit('DeletedList', {
                    list: {
                        id: list.id
                    },
                    hash: req.query.hash,
                    username: req.session.username
                });
                res.sendStatus(200);
            }).catch(function(err) {
                return handleError(err, next);
            });
        }
    }).catch(function(err) {
        return handleError(err, next);
    });
});



module.exports = router;
