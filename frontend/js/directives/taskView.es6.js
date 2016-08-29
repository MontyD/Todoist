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

        }
    };
}

export default task;
