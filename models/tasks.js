'use strict';

module.exports = function(sequelize, DataTypes) {
    var task = sequelize.define('tasks', {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: DataTypes.ENUM('Todo', 'In progress', 'Complete', 'Later'),
        username: DataTypes.TEXT
    });
    return task;
};
