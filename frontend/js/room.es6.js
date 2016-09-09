import angular from 'angular';
import uiRouter from 'angular-ui-router';

import io from 'socket.io-client';
window.io = io;

import RoomConfig from './config/RoomConfig.es6.js';

import RoomCtrl from './controllers/RoomCtrl.es6.js';
import OverviewCtrl from './controllers/OverviewCtrl.es6.js';
import SettingsCtrl from './controllers/SettingsCtrl.es6.js';

import taskView from './directives/taskView.es6.js';
import todoList from './directives/todoList.es6.js';

//Vendor imports
import uiNotification from 'angular-ui-notification';
import dirPagination from 'angular-utils-pagination';

import TasksService from './services/tasks.es6.js';
import SocketsService from './services/sockets.es6.js';
import RoomService from './services/room.es6.js';
import TodoListsService from './services/todolists.es6.js';

angular.module('app', [uiRouter, 'ui-notification', 'angularUtils.directives.dirPagination'])
    .controller('RoomCtrl', RoomCtrl)
    .controller('OverviewCtrl', OverviewCtrl)
    .controller('SettingsCtrl', SettingsCtrl)
    .directive('taskView', taskView)
    .directive('todoList', todoList)
    .service('TasksService', TasksService)
    .service('SocketsService', SocketsService)
    .service('RoomService', RoomService)
    .service('TodoListsService', TodoListsService)
    .config(RoomConfig);
