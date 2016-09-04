function todoList() {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            index: '=',
            list: '=',
            createTask: '=',
            editTask: '=',
            deleteTask: '=',
            editList: '&',
            deleteList: '&'
        },
        template: require('./templates/todoList.template.html'),

        link: function(scope, element, attrs) {

        }
    };
}

export default todoList;
