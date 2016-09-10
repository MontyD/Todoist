function todoList() {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            index: '=',
            list: '=',
            createTodo: '=createtodo',
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

          scope.attemptedSubmit = false;

          scope.newTask = {
            title: '',
            status: 'Todo'
          };

          scope.addTask = valid => {
            if (!valid) {
              scope.attemptedSubmit = true;
              return;
            }
            scope.createTodo(scope.list.id, scope.newTask);
            scope.newTask.title = '';
            return;
          };

        }
    };
}

export default todoList;
