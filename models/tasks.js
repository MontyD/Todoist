'use strict';

module.exports = function(sequelize, DataTypes) {
    var task = sequelize.define('tasks', {
            title: DataTypes.STRING,
            description: DataTypes.TEXT,
            status: DataTypes.ENUM('open','fixed','verified fixed','closed','next','in progress'),
            component: DataTypes.STRING,
        });
        return task;
};
