
(function () {
    'use strict';

    angular
        .module('nomumo')
        .controller('createdCtrl', createdCtrl);

    createdCtrl.$inject = ['$scope', '$stateParams', '$location', '$translate'];

    function createdCtrl($scope, $stateParams, $location, $translate) {
        var splittedURL=$location.absUrl().split('/');
        $scope.pollURL=splittedURL[0]+'//'+splittedURL[2]+'/'+'poll'+'/'+splittedURL[4];
        $scope.pollID=$stateParams.pollID;
    }

})();