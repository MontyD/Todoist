import angular from 'angular';
import uiRouter from 'angular-ui-router';

import userHomeConfig from './config/userHomeConfig.es6.js';

import UserHomeCtrl from './controllers/userHome.es6.js';

//Vendor imports
import uiNotification from 'angular-ui-notification';


angular.module('app', [uiRouter, 'ui-notification'])
  .controller('UserHomeCtrl', UserHomeCtrl)
  .config(userHomeConfig);
