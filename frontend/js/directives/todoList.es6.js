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

          scope.editing = false;

          scope.deleting = false;

          scope.toggleListEdit = () => scope.editing = !scope.editing;

        }
    };
}

export default todoList;
