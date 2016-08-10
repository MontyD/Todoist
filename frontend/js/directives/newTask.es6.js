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

    }
  };
}
