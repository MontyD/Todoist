import angular from 'angular';
import uiRouter from 'angular-ui-router';

import io from 'socket.io-client';

import RoomConfig from './config/RoomConfig.es6.js';

import RoomCtrl from './controllers/RoomCtrl.es6.js';
import OverviewCtrl from './controllers/OverviewCtrl.es6.js';
import SettingsCtrl from './controllers/SettingsCtrl.es6.js';

import newTask from './directives/newTask.es6.js';
import taskView from './directives/taskView.es6.js';

//Vendor imports
import uiNotification from 'angular-ui-notification';

import TasksService from './services/tasks.es6.js';
import SocketsService from './services/sockets.es6.js';
import RoomService from './services/room.es6.js';
import TodoListsService from './services/todo-lists.js';

window.io = io;

angular.module('app', [uiRouter, 'ui-notification'])
    .controller('RoomCtrl', RoomCtrl)
    .controller('OverviewCtrl', OverviewCtrl)
    .controller('SettingsCtrl', SettingsCtrl)
    .directive('newTask', newTask)
    .directive('taskView', taskView)
    .service('TasksService', TasksService)
    .service('SocketsService', SocketsService)
    .service('RoomService', RoomService)
    .todoListsService('TodoListsService', TodoListsService)
    .config(RoomConfig);
