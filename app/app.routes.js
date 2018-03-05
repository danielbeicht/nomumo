(function () {
    'use strict';
    angular
        .module('nomumo')
        .config(uiRouterConfig)

    uiRouterConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

    function uiRouterConfig($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/home/pollInfos');
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'app/components/home/home.html',
                controller: 'homeCtrl'
            })

            .state('home.pollInfos', {
                url: '/pollInfos',
                templateUrl: 'app/components/home/form-pollInfos.html'
            })

            .state('home.pollDate', {
                url: '/pollDate',
                templateUrl: 'app/components/home/form-pollDate.html'
            })

            .state('home.pollDateTime', {
                url: '/pollDateTime',
                templateUrl: 'app/components/home/form-pollDateTime.html'
            })

            .state('home.pollOption', {
                url: '/pollOption',
                templateUrl: 'app/components/home/form-pollOption.html'
            })

            .state('poll', {
                url: "/poll/:pollID",
                templateUrl: 'app/components/poll/poll.html',
                controller: 'pollCtrl'
            })

            .state('created', {
                url: "/created/:pollID",
                templateUrl: 'app/components/created/created.html',
                controller: 'createdCtrl'
            })

            .state('unsubscribe', {
                url: "/unsubscribe?userHash&pollID",
                templateUrl: 'app/components/unsubscribe/unsubscribe.html',
                controller: 'unsubscribeCtrl'
            })

            .state('about', {
                url: "/about",
                templateUrl: 'app/components/about/about.html',
                controller: 'aboutCtrl'
            })

        ;
        $locationProvider.html5Mode(true);


    }
})();
