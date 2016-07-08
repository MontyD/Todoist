'use strict';

function config($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            template: require('../templates/userHome.page.html'),
            controller: 'UserHomeCtrl',
            controllerAs: 'home'
        });
}

export default ['$stateProvider', '$urlRouterProvider', '$locationProvider', config];
