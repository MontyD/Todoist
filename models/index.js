'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var db = {};

if (config.use_env_variable) {
    var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    var sequelize = new Sequelize(config.database, config.username, config.password, config);
}


  ['./rooms.js', './tasks.js', './todoLists.js'].forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;


// Relationships
db.tasks.belongsTo(db.todoLists);
db.todoLists.hasMany(db.tasks, {hooks: true });

db.rooms.hasMany(db.tasks, { onDelete: 'cascade', hooks: true });
db.tasks.belongsTo(db.rooms);

db.todoLists.belongsTo(db.rooms);
db.rooms.hasMany(db.todoLists, { onDelete: 'cascade', hooks: true });


module.exports = db;
