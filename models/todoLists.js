'use strict';

module.exports = function(sequelize, DataTypes) {
    var todoList = sequelize.define('todoLists', {
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
    return todoList;
};
