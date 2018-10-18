(function () {
    'use strict';

    angular
        .module('nomumo')
        .controller('unsubscribeCtrl', unsubscribeCtrl);

    unsubscribeCtrl.$inject = ['$scope', '$stateParams', '$location', '$http'];

    function unsubscribeCtrl($scope, $stateParams, $location, $http) {
        let splittedURL=$location.absUrl().split('/');
        $scope.pollURL=splittedURL[0]+'//'+splittedURL[2]+'/'+'poll'+'/'+$stateParams.pollID;
        $scope.pollID=$stateParams.pollID;

        let parObj = {};
        parObj.userHash = $stateParams.userHash;
        parObj.pollID = $stateParams.pollID;

        let parameter = JSON.stringify(parObj);

        $http.post("/unsubscribe", parameter).
        success(function(data) {
            if (data.statusCode === 0){
                $scope.infoMessage = "Ihre E-Mail-Adresse wurde erfolgreich aus der folgenden Umfrage ausgetragen:";
            } else if (data.statusCode === 1){
                $scope.infoMessage = "Ein Fehler ist aufgetreten. Bitte wende Sie sich an die Administratoren (siehe About).";
            }
        }).
        error(function() {
            $scope.infoMessage = "Ein Fehler ist aufgetreten. Bitte wende Sie sich an die Administratoren (siehe About).";
        });


    }

})();