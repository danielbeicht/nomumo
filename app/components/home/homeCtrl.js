(function () {
    'use strict';

    angular
        .module('nomumo')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$filter', '$http', '$window', '$state', '$rootScope', '$translate'];
    function homeCtrl($scope, $filter, $http, $window, $state, $rootScope, $translate) {
        $scope.formData = {};
        $scope.formData.dates = [];
        $scope.formData.maybe = 1;
        $scope.times = [];
        $scope.timesCount = 3;

        $scope.getPollModeImageLocation = function(){
            console.log($scope.location);
            if ($translate.use() === "de_DE" || $translate.use() === "de"){
                return "de";
            } else {
                return "eng";
            }
        }


        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams){
                if (toState.url == "/pollDate"){
                    if (!$scope.formData.title || !$scope.formData.name || !$scope.formData.email){
                        event.preventDefault();
                    }
                }
                else if (toState.url == "/pollDateTime"){
                    if ($scope.formData.dates.length==0){
                        event.preventDefault();
                    }
                }
            });


        $scope.submitForm = function () {

            if ($scope.formData.dates.length > 0 && $scope.formData.title && $scope.formData.name && $scope.formData.email && !$scope.checkDuplicates()) {


                for (var i = 0; i < $scope.formData.dates.length; i++) {
                    var length = $scope.formData.dates[i].time.length;
                    for (var j = length - 1; j >= 0; j--) {
                        console.log("test");
                        if ($scope.formData.dates[i].time[j] == "") {
                            $scope.formData.dates[i].time.splice(j, 1);
                        } else {
                            console.log("WTF");
                        }
                    }
                    console.log($scope.formData.dates[i].time.length);
                }

                var parameter = JSON.stringify($scope.formData);
                console.log(parameter);

                $http.post("/createPoll", parameter).success(function (data, config) {
                    $window.location.href = '/created/' + data.pollID;
                }).error(function (data, status, headers, config) {
                    console.log("Error creating poll.")
                });
            }

        };

        $scope.goToDatum = function(isValid){
            // Change Location (googles fault)
            console.log($scope.formData.location);
            if ($scope.formData.location){
                if ($scope.formData.location.formatted_address) {
                    $scope.formData.location = $scope.formData.location.formatted_address;
                }
            }
            if (isValid) {
                $state.go('home.pollDate');
            } else {
                console.log("False");
            }
        }


        $scope.goToUhrzeit = function(){
            console.log("called");
            if ($scope.formData.dates.length > 0){
                $scope.warningMessage = false;
                $state.go('home.pollDateTime');
            } else {
                $scope.warningText = "Bitte wählen Sie mindestens ein Datum."
                $scope.warningMessage = true;
            }

        }

        $scope.getTimeModel = function(index){
            return "ok";
        }


        // Watcher
        $scope.$watch('formData.dt', function(newValue, oldValue) {
            console.log(newValue);
            if (newValue !== oldValue) {
                var datefilter = $filter('date');
                var formattedDate = datefilter($scope.formData.dt, 'yyyy/MM/dd');
                console.log(formattedDate);
                if (!isDateInDates(formattedDate)){
                    $scope.warningMessage = false;
                    var obj = new Object();
                    obj.date = formattedDate;
                    obj.time = [];
                    for (var i=0; i<$scope.timesCount; i++){
                        obj.time.push("");
                    }

                    $scope.formData.dates.push(obj);
                    $scope.formData.dates.sort(compare);
                } else {
                    $scope.warningText = "Das Datum " + formattedDate + " wurde bereits gewählt."
                    $scope.warningMessage = true;
                }
            }
        });


        function compare(a,b) {
            if (a.date < b.date)
                return -1;
            if (a.date > b.date)
                return 1;
            return 0;
        }




        function isDateInDates(date){
            for (var i=0; i<$scope.formData.dates.length; i++){
                if ($scope.formData.dates[i].date == date){
                    return true;
                }
            }
            return false;
        }

        $scope.removeDate = function(date){
            $scope.formData.dates.splice($scope.formData.dates.indexOf(date), 1);
        }

        $scope.addTime = function(){
            if ($scope.timesCount >= 4){
                var offset = 200*($scope.timesCount-3);
                var pixels = 1000+offset;
                document.getElementById("limit").style.width = pixels + "px";
            }
            $scope.timesCount++;
            var obj = new Object();
                obj.time = $scope.timesCount;

            obj.model = parseInt($scope.timesCount-1);
            $scope.times.push(obj);

            for (var i=0; i<$scope.formData.dates.length; i++){
                $scope.formData.dates[i].time.push("");
            }
        }


        $scope.checkDuplicates = function (){
            var errorExists = false;
            for (var i=0; i<$scope.formData.dates.length; i++){
                errorExists = check($scope.formData.dates[i].time);
                if (errorExists){
                    $scope.warningMessage=true;
                    $scope.warningText = "Es wurden zwei identische Zeitfelder bei einem Datum gefunden.";
                    break;
                }
            }

            if (!errorExists){
                $scope.warningMessage=false;
                return false;
            }
            return true;


            function check(arr){
                var counts = [];
                for(var i = 0; i <= arr.length; i++) {
                    if(counts[arr[i]] === undefined || arr[i] == null || arr[i] == "") {
                        counts[arr[i]] = 1;
                    } else {
                        return true;
                    }
                }

                return false;
            }
        }

    }
})();

