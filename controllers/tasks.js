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
                ['updatedAt', 'DESC'],
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
        var userId = req.user.id;
        models.tasks.findAll({
            where: {
                userId: userId
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

// CREATE NEW
router.post('/', function(req, res, next) {

    if (!req.body.task) {
      var error = new Error('Bad get request');
      error.status = 400;
      return next(error);
    }

    var task = req.body.task;

    task.userId = 1;

    models.tasks.create(task).then(function(task) {
        res.sendStatus(200);
    }).catch(function(err) {
        handleError(err, next);
    });

});


module.exports = router;
