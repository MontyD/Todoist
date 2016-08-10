'use strict';

module.exports = function(sequelize, DataTypes) {
    var task = sequelize.define('tasks', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: DataTypes.ENUM('Todo', 'In progress', 'Done', 'Later'),
        username: DataTypes.TEXT
    });
    return task;
};
