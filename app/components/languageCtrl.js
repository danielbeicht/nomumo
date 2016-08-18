(function () {
    'use strict';

    angular
        .module('nomumo')
        .controller('languageCtrl', languageCtrl);

    languageCtrl.$inject = ['$scope', '$translate'];
    function languageCtrl($scope, $translate) {


        $scope.$watch('language', function(newValue, oldValue) {
            if (newValue){
                $translate.use(newValue).then(function (newValue) {
                    console.log("Sprache zu " + newValue + " gewechselt.");
                }, function (key) {
                    console.log("Irgendwas lief schief.");
                });
            }
            $scope.location = $translate.use();
        });



    }
})();
