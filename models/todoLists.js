'use strict';

module.exports = function(sequelize, DataTypes) {
    var todoList = sequelize.define('todoLists', {
        name: DataTypes.TEXT,
    });
    return todoList;
};
