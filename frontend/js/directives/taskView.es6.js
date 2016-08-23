function task() {
    'use strict';
    return {
        restrict: 'E',
        scope: {
            task: '=',
            edited: '&',
            deleted: '&',
            completed: '&'
        },
        template: require('./templates/taskView.template.html'),

        link: function(scope, element, attrs) {

            scope.taskComplete = () => scope.completed(scope.task.id);

        }
    };
}

export default task;
