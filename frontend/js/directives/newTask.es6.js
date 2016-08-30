function newTask() {
  'use strict';
  return {
    restrict: 'E',
    scope: {
      task: '=',
      createTask: '&'
    },
    template: require('./templates/newTask.template.html'),

    link: function(scope, element, attrs) {

      scope.attemptedSubmit = false;

      scope.submitForm = function(valid) {
        if (!valid) {
          scope.attemptedSubmit = true;
          return;
        }
        scope.attemptedSubmit = false;
        scope.createTask();
      };

    }
  };
}

export default newTask;
