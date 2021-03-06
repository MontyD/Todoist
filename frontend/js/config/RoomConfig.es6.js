'use strict';

function config($stateProvider, $urlRouterProvider, $locationProvider, $animateProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $animateProvider.classNameFilter(/js-ani/);

    $stateProvider
        .state('home', {
            url: '/',
            template: require('../templates/Room.page.html'),
            controller: 'RoomCtrl',
            controllerAs: 'home'
        })
        .state('overview', {
            url: '/overview',
            template: require('../templates/Overview.page.html'),
            controller: 'OverviewCtrl',
            controllerAs: 'overview'
        })
        .state('settings', {
            url: '/settings',
            template: require('../templates/Settings.page.html'),
            controller: 'SettingsCtrl',
            controllerAs: 'settings'
        });

}

export default ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$animateProvider', config];
