'use strict';

module.exports = function(sequelize, DataTypes) {
    var todoList = sequelize.define('todoLists', {
        name: DataTypes.TEXT,
    }, {
        hooks: {
          // destory non-completed tasks
            beforeDestroy: function(instance, options, cb) {
              var models = require('./index.js');
                models.tasks.destroy({
                    where: {
                        todoListId: instance.id,
                        status: {
                            $ne: 'Complete'
                        }
                    }
                }).then(function() {
                    return cb(null, options);
                }).catch(function(err) {
                    return cb(err, options);
                });
            }
        }
    });
    return todoList;
};
