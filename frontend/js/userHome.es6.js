import angular from 'angular';
import uiRouter from 'angular-ui-router';

import userHomeConfig from './config/userHomeConfig.es6.js';

import UserHomeCtrl from './controllers/userHome.es6.js';

//Vendor imports
import uiNotification from 'angular-ui-notification';

import TasksService from './services/tasks.es6.js';

angular.module('app', [uiRouter, 'ui-notification'])
  .controller('UserHomeCtrl', UserHomeCtrl)
  .service('TasksService', TasksService)
  .config(userHomeConfig);
