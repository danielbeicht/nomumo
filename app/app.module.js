(function () {
    'use strict';
    //modules/services that the app uses/depends on
    angular
        .module('nomumo', [
            'ui.router',
            'ngAnimate',
            'ui.bootstrap',
            'ngRoute',
            'google.places',
            'angular-clipboard',
            'pascalprecht.translate'
        ]);
})();