'use strict';

var express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require(path.join(__dirname, '..', 'models')),
    respondsToJSON = require(path.join(__dirname, '..', 'middlewares', 'respondsJSON')),
    checkUser = require(path.join(__dirname, '..', 'middlewares', 'checkUser')),
    handleError = require(path.join(__dirname, '..', 'middlewares', 'handleError'));

// GET ALL
router.get('/', respondsToJSON, checkUser, function(req, res, next) {

    var start = req.query.start || 0;
    var limit = req.query.limit || 10;

    // ADMIN FETCH ALL
    if (req.query.all && req.user.admin) {
        models.tasks.findAll({
            order: [
                ['priority', 'DESC'],
                ['updatedAt'],
            ],
            limit: limit,
            offset: start
        }).then(function(tasks) {
            return res.json(tasks);
        }).catch(function(err) {
            return handleError(err, next);
        });

        // STANDARD USER
    } else {
        var reporterId = req.user.id;
        models.tasks.findAll({
            where: {
                reporterId: reporterId
            },
            order: [
                ['priority', 'DESC'],
                ['updatedAt', 'DESC'],
            ],
            limit: limit,
            offset: start
        }).then(function(tasks) {
            return res.json(tasks);
        }).catch(function(err) {
            return handleError(err, next);
        });
    }
});


// GET one task by ID
router.get('/:taskID', respondsToJSON, checkUser, function(req, res, next) {

    if (isNaN(req.params.taskID)) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        } else {
            if (task.userId === req.user.id || req.user.admin) {
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
router.post('/', respondsToJSON, checkUser, function(req, res, next) {

    if (!req.body.task) {
        var error = new Error('Bad get request');
        error.status = 400;
        return next(error);
    }

    var task = req.body.task;

    // for testing, remove
    task.userId = req.user.id;

    models.tasks.create(task).then(function(newTask) {
        res.send(newTask);
    }).catch(function(err) {
        return handleError(err, next);
    });

});


// Update task by id
router.put('/:taskID', respondsToJSON, checkUser, function(req, res, next) {

    if (isNaN(req.params.taskID) || !req.body.task) {
        var error = new Error('Bad put data');
        error.status = 400;
        return next(error);
    }

    models.tasks.findById(req.params.taskID).then(function(task) {
        if (!task) {
            return next();
        } else {
            if (task.userId === req.user.id || req.user.admin) {
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
          if (task.userId === req.user.id || req.user.admin) {
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
