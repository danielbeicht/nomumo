(function () {
    'use strict';

    angular
        .module('nomumo')
        .controller('languageCtrl', languageCtrl);

    languageCtrl.$inject = ['$scope', '$translate', '$cookies'];
    function languageCtrl($scope, $translate, $cookies) {

        $scope.$watch('language', function(newValue, oldValue) {
            if (newValue){
                $translate.use(newValue).then(function (newValue) {
                    console.log("Sprache zu " + newValue + " gewechselt.");
                    $cookies.put('language', newValue);
                }, function (key) {
                    console.log("Irgendwas lief schief.");
                });
            }
            $scope.location = $translate.use();
        });

        if ($cookies.get('language')){
            $scope.language = $cookies.get('language');
        }

    }
})();
