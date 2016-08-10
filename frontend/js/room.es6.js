import angular from 'angular';
import uiRouter from 'angular-ui-router';

import RoomConfig from './config/RoomConfig.es6.js';

import RoomCtrl from './controllers/RoomCtrl.es6.js';

//Vendor imports
import uiNotification from 'angular-ui-notification';

import TasksService from './services/tasks.es6.js';

angular.module('app', [uiRouter, 'ui-notification'])
  .controller('RoomCtrl', RoomCtrl)
  .service('TasksService', TasksService)
  .config(RoomConfig);
