function task() {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            task: '=',
            edited: '&',
            deleted: '&',
        },
        template: require('./templates/taskView.template.html'),

        link: function(scope, element, attrs) {

          scope.cachedTask = {};

          scope.editing = false;

          scope.edit = () => {

            scope.cachedTask = scope.task;

            scope.editing = true;

          };

          scope.cancelEdit = () => {

            scope.task = scope.cachedTask;

            scope.editing = false;

          };

          scope.save = () => {

            scope.editing = false;

            scope.edited();

          };

          scope.completed = () => {

            task.status = "Complete";

            scope.edited();

          }

        }
    };
}

export default task;
