function todoList() {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            index: '=',
            list: '=',
            createTask: '=createtask',
            editTask: '=edittask',
            deleteTask: '=deletetask',
            editList: '&editlist',
            deleteList: '&deletelist'
        },
        template: require('./templates/todoList.template.html'),

        link: function(scope, element, attrs) {

          scope.editing = false;

          scope.deleting = false;

          scope.toggleListEdit = () => scope.editing = !scope.editing;

          scope.submitListEdit = () => {
            scope.editList();
            scope.toggleListEdit();
          };

          scope.toggleListDelete = () => scope.deleting = !scope.deleting;

          scope.removeList = () => {
            scope.toggleListDelete();
            scope.deleteList();
          };

        }
    };
}

export default todoList;
