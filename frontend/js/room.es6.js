import angular from 'angular';
import uiRouter from 'angular-ui-router';

import io from 'socket.io-client';

import RoomConfig from './config/RoomConfig.es6.js';

import RoomCtrl from './controllers/RoomCtrl.es6.js';

import newTask from './directives/newTask.es6.js';
import taskView from './directives/taskView.es6.js';

//Vendor imports
import uiNotification from 'angular-ui-notification';

import TasksService from './services/tasks.es6.js';
import SocketsService from './services/sockets.es6.js';

window.io = io;

angular.module('app', [uiRouter, 'ui-notification'])
    .controller('RoomCtrl', RoomCtrl)
    .directive('newTask', newTask)
    .directive('taskView', taskView)
    .service('TasksService', TasksService)
    .service('SocketsService', SocketsService)
    .config(RoomConfig);
