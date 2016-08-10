'use strict';

module.exports = function(sequelize, DataTypes) {
    var task = sequelize.define('tasks', {
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        status: DataTypes.ENUM('Todo', 'In progress', 'Done', 'Later'),
        username: DataTypes.TEXT
    });
    return task;
};
