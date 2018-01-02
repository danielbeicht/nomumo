(function () {
    'use strict';

    angular
        .module('nomumo')
        .controller('pollCtrl', pollCtrl);

    pollCtrl.$inject = ['$scope', '$stateParams', '$http', '$translate'];

    function pollCtrl($scope, $stateParams, $http, $translate) {
        $scope.editMode = false;
        $scope.showAddComment = false;


        $scope.fillTable = function (obj, user) {
            if (obj.time == null) {
                for (var j = 0; j < user.userPollDates.length; j++) {
                    if (user.userPollDates[j].pollDateID == obj.pollDateID) {
                        return user.userPollDates[j].result;
                    }
                }
            } else {
                //console.log(obj);
                for (var j = 0; j < user.userPollTimes.length; j++) {
                    if (user.userPollTimes[j].pollDateTimeID == obj.userPollTimeID) {

                        return user.userPollTimes[j].result;
                    }
                }
            }
            return "error";
        }

        $scope.editCell = function(obj, user, value){
            if (obj.time == null) {
                for (var j = 0; j < user.userPollDates.length; j++) {
                    if (user.userPollDates[j].pollDateID == obj.pollDateID) {
                        user.userPollDates[j].result = value;
                        //return user.userPollDates[j].result;
                    }
                }
            } else {
                //console.log(obj);
                for (var j = 0; j < user.userPollTimes.length; j++) {
                    if (user.userPollTimes[j].pollDateTimeID == obj.userPollTimeID) {
                        user.userPollTimes[j].result = value;
                        //return user.userPollTimes[j].result;
                    }
                }
            }
            return "error";
        }

        $scope.hoverIn = function(){

            this.hoverEdit = true;
        };

        $scope.hoverOut = function(){
            this.hoverEdit = false;
        };

        $scope.setEditMode = function(user){
            var colWidth = document.getElementById("firstcol").offsetWidth;
            for (var i=0; i<$scope.data.users.length; i++){
                $scope.data.users[i].editable = false;
            }
            user.editable = true;
            $scope.editMode = true;
            $scope.editUserID = user.userID;
            document.getElementById("firstcol").style.width = colWidth + "px";
        };


        $scope.saveUserPoll = function(){
            for (var i=0; i<$scope.data.users.length; i++){
                if ($scope.data.users[i].userID == $scope.editUserID){
                    if ($scope.data.users[i].name){
                        var parObj = new Object();
                        parObj.user = $scope.data.users[i];

                        var parameter = JSON.stringify(parObj);
                        console.log(parameter);

                        $http.post("/changeUserPoll", parameter).
                        success(function(data, config) {
                            console.log("Success");
                            $scope.init();
                        }).
                        error(function(data, status, headers, config) {

                        });
                        $scope.data.users[i].editable=false;
                        $scope.editMode = false;
                        $scope.error=false;
                    } else {
                        $scope.error=true;
                        $scope.errorText =  "Bitte geben Sie einen gültigen Namen ein.";
                    }

                }
            }
        }

        $scope.deleteUserPoll = function(user) {
            var result = confirm("Wollen Sie wirklich die Abstimmung löschen?");
            if (result) {
                var parObj = new Object();
                parObj.userID = user.userID;
                $http.post("/deleteUserPoll", JSON.stringify(parObj)).success(function (data, config) {
                    $scope.init();
                }).error(function (data, status, headers, config) {
                });
            }
        }

        $scope.saveComment = function() {
            var parObj = new Object();
            parObj.name = $scope.formData.name;
            parObj.pollID = $stateParams.pollID;
            parObj.comment = $scope.formData.comment;

            var parameter = JSON.stringify(parObj);

            $http.post("/saveComment", parameter).
            success(function(data, config) {
                $scope.loadComments();
                $scope.toggleAddComment();
                $scope.formData.name = "";
                $scope.formData.comment = "";
            }).
            error(function(data, status, headers, config) {
            });
        }

        $scope.deleteComment = function(comment) {
            var result = confirm("Wollen Sie wirklich den Kommentar löschen?");
            if (result){
                var parObj = new Object();
                parObj.pollID = $stateParams.pollID;
                parObj.commentID = comment.commentID;

                var parameter = JSON.stringify(parObj);
                $http.post("/deleteComment", parameter).
                success(function(data, config) {
                    $scope.loadComments();
                }).error(function(data, status, headers, config) {

                });
            }
        }

        $scope.changeComment = function(comment){
            var parObj = new Object();
            parObj.name = comment.name;
            parObj.commentID = comment.commentID;
            parObj.comment = comment.comment;
            var parameter = JSON.stringify(parObj);
            $http.post("/changeComment", parameter).
            success(function(data, config) {
                $scope.loadComments();
            }).
            error(function(data, status, headers, config) {
            });

        }

        $scope.setEditableTrue = function(comment){
            for (var i=0; i<$scope.comments.length; i++){
                $scope.comments[i].editable = false;
            }
            comment.editable = true;
        }


        $scope.init = function () {
            console.log("init called");
            $http({
                method : "GET",
                url : "getpoll",
                params: {pollid: $stateParams.pollID}
            }).then(function mySucces(response) {
                $scope.data = response.data;

                console.log(response.data);

                var weekdayDE = new Array(7);
                weekdayDE[0]=  "So";
                weekdayDE[1] = "Mo";
                weekdayDE[2] = "Di";
                weekdayDE[3] = "Mi";
                weekdayDE[4] = "Do";
                weekdayDE[5] = "Fr";
                weekdayDE[6] = "Sa";

                var weekdayEN = new Array(7);
                weekdayEN[0]=  "Sun";
                weekdayEN[1] = "Mon";
                weekdayEN[2] = "Tues";
                weekdayEN[3] = "Wed";
                weekdayEN[4] = "Thurs";
                weekdayEN[5] = "Fri";
                weekdayEN[6] = "Sat";


                $scope.tableContent = [];
                $scope.noTimes = false;
                for (var i = 0; i < $scope.data.dates.length; i++) {
                    var timesCount = $scope.data.dates[i].time.length;
                    if (timesCount == 0) {
                        var obj = new Object();
                        if ($translate.use()=="de_DE"){
                            obj.visibleDate = weekdayDE[new Date($scope.data.dates[i].date.replace(/-/g, "/")).getDay()] + "\n" + $scope.getDateString($scope.data.dates[i].date);
                        } else {
                            obj.visibleDate = weekdayEN[new Date($scope.data.dates[i].date).getDay()] + "\n" + $scope.getDateString($scope.data.dates[i].date);
                        }

                        obj.date = $scope.data.dates[i].date;
                        obj.checked = -1; // -1
                        obj.time = null;
                        obj.pollDateID =  $scope.data.dates[i].pollDateID;
                        $scope.tableContent.push(obj);

                    } else {
                        $scope.noTimes = true;
                        for (var j = 0; j < timesCount; j++) {
                            var obj = new Object();
                            if (j == 0) {

                                if ($translate.use()=="de_DE"){
                                    obj.visibleDate = weekdayDE[new Date($scope.data.dates[i].date).getDay()] + "\n" + $scope.getDateString($scope.data.dates[i].date);
                                } else {
                                    obj.visibleDate = weekdayEN[new Date($scope.data.dates[i].date).getDay()] + "\n" + $scope.getDateString($scope.data.dates[i].date);
                                }

                                //obj.visibleDate = $scope.getDateString($scope.data.dates[i].date);
                            } else {
                                obj.visibleDate = "";
                            }
                            obj.date = $scope.data.dates[i].date;
                            obj.checked = -1; // -1
                            obj.time = $scope.data.dates[i].time[j].time;
                            obj.userPollTimeID = $scope.data.dates[i].time[j].pollDateTimesID;
                            $scope.tableContent.push(obj);
                        }
                    }

                }




                // Count
                $scope.resultCount = [];
                if ($scope.data) {
                    if ($scope.data.dates) {
                        for (var i = 0; i < $scope.data.dates.length; i++) {
                            if ($scope.data.dates[i].time.length > 0) { // evtl weg
                                for (var j = 0; j < $scope.data.dates[i].time.length; j++) {
                                    var obj = new Object();
                                    obj.ok = 0;
                                    obj.no = 0;
                                    obj.maybe = 0;
                                    obj.max = false;
                                    var pollDateTimesID = $scope.data.dates[i].time[j].pollDateTimesID;
                                    for (var k = 0; k < $scope.data.users.length; k++) {
                                        for (var l = 0; l < $scope.data.users[k].userPollTimes.length; l++) {
                                            if ($scope.data.users[k].userPollTimes[l].pollDateTimeID == pollDateTimesID) {
                                                switch ($scope.data.users[k].userPollTimes[l].result) {
                                                    case 0:
                                                        obj.no++;
                                                        break;
                                                    case 1:
                                                        obj.ok++;
                                                        break;
                                                    case 2:
                                                        obj.maybe++;
                                                        break;
                                                }
                                            }
                                        }
                                    }
                                    $scope.resultCount.push(obj);
                                }
                            } else {
                                var obj = new Object();
                                obj.ok = 0;
                                obj.no = 0;
                                obj.maybe = 0;
                                obj.max = false;
                                var pollDateID = $scope.data.dates[i].pollDateID;
                                for (var k = 0; k < $scope.data.users.length; k++) {
                                    for (var l = 0; l < $scope.data.users[k].userPollDates.length; l++) {
                                        if ($scope.data.users[k].userPollDates[l].pollDateID == pollDateID) {
                                            switch ($scope.data.users[k].userPollDates[l].result) {
                                                case 0:
                                                    obj.no++;
                                                    break;
                                                case 1:
                                                    obj.ok++;
                                                    break;
                                                case 2:
                                                    obj.maybe++;
                                                    break;
                                            }
                                        }
                                    }
                                }
                                $scope.resultCount.push(obj);
                            }
                        }
                    }
                }
                if ($scope.data.maybe==0){
                    var max = 0;
                    for (var i=0; i<$scope.resultCount.length; i++){
                        if ($scope.resultCount[i].ok>max){
                            max = $scope.resultCount[i].ok;
                        }
                    }
                    for (var i=0; i<$scope.resultCount.length; i++){
                        if ($scope.resultCount[i].ok == max){
                            $scope.resultCount[i].max = true;
                        }
                    }
                } else {
                    var max = 0;
                    for (var i=0; i<$scope.resultCount.length; i++){
                        if ($scope.resultCount[i].ok + $scope.resultCount[i].maybe > max){
                            max = $scope.resultCount[i].ok + $scope.resultCount[i].maybe;
                        }
                    }

                    var multiple = 0;
                    for (var i=0; i<$scope.resultCount.length; i++){
                        if ($scope.resultCount[i].ok + $scope.resultCount[i].maybe  == max){
                            multiple++;
                            $scope.resultCount[i].max = true;
                        }
                    }

                    if (multiple>1){
                        var max = 0;
                        for (var i=0; i<$scope.resultCount.length; i++){
                            if ($scope.resultCount[i].ok>max && $scope.resultCount[i].max == true){
                                max = $scope.resultCount[i].ok;
                            }
                        }
                        for (var i=0; i<$scope.resultCount.length; i++){
                            if ($scope.resultCount[i].ok < max){
                                $scope.resultCount[i].max = false;
                            }
                        }
                    }
                }




                //console.log(document.getElementById("col-1"));
                // Set length of table

                //console.log(colWidth);
                console.log("Finished loading");


            }, function myError(response) {
                $scope.myWelcome = response.statusText;
            });
        }
        $scope.loadComments = function(){
            $http({
                method : "GET",
                url : "getComments",
                params: {pollID: $stateParams.pollID}
            }).then(function mySucces(response) {
                $scope.comments = response.data;
                for (var i=0; i<$scope.comments.length; i++){
                    $scope.comments[i].date = new Date($scope.comments[i].date).toLocaleDateString() + "; " +  new Date($scope.comments[i].date).toLocaleTimeString();
                    $scope.comments[i].editable = false;
                    $scope.comments[i].showOptions = false;
                }
                console.log("Comments loaded");

            }, function myError(response) {
                $scope.myWelcome = response.statusText;
            });

        }



        $scope.init();

        $scope.lockTableSize = false;


        $scope.loadComments();

        $scope.loaded = function(){
            var colWidth = 0;

            if (!$scope.lockTableSize){
                if ($scope.tableContent){
                    for (var i=0; i<$scope.tableContent.length; i++){
                        if (document.getElementById("col-" + i)){
                            colWidth += document.getElementById("col-" + i).offsetWidth;
                        }
                    }
                }
                if (colWidth > 700){
                    document.getElementById("limit").style.width = colWidth+300 + "px";
                }
                if (colWidth != 0){
                    $scope.lockTableSize = true;
                }
            }
        }



        $scope.getDateString = function(date){
            return new Date(date.replace(/-/g, "/")).toLocaleDateString();
        }

        $scope.toggleAddComment = function(){
            console.log("Called");
            $scope.showAddComment = !$scope.showAddComment;
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }


        $scope.addUserPoll = function() {
            console.log("called");
            console.log(document.getElementById("col-1"));
            //console.log($scope.tableContent);


            if ($scope.name){
                if (!$scope.informEmail || validateEmail($scope.informEmail)){
                    for (var i = 0; i < $scope.tableContent.length; i++) {
                        if ($scope.tableContent[i].checked == -1){
                            $scope.tableContent[i].checked = 0;
                        }
                    }


                    var parObj = new Object();
                    parObj.name = $scope.name;
                    parObj.pollID = $stateParams.pollID;
                    parObj.content = $scope.tableContent;
                    if ($scope.informEmail){
                        parObj.informEmail = $scope.informEmail;
                    }

                    var parameter = JSON.stringify(parObj);
                    console.log(parameter);

                    $http.post("/addUserPoll", parameter).
                    success(function(data, config) {
                        if (data.code==0){
                            $scope.error=false;
                        }
                        else if (data.code==1){
                            $scope.error=true;
                            var name = $scope.name;
                            $scope.errorText =  "Der Name '" + name + "' ist in der Umfrage bereits vergeben. Bitte wählen Sie einen neuen.";
                        }
                        $scope.name = null;
                        $scope.informEmail = null;

                        $scope.init();


                    }).
                    error(function(data, status, headers, config) {

                    });
                } else {
                    $scope.error=true;
                    $scope.errorText =  "Bitte geben Sie einen gültige E-Mail-Adresse ein.";
                }

            } else {
                $scope.error=true;
                $scope.errorText =  "Bitte geben Sie einen gültigen Namen ein.";
            }
        }

        $scope.setMaybeStatus = function(obj){

        }


    }
})();

angular
    .module('nomumo')
    .directive('whenReady', ['$interpolate', function($interpolate) {
        return {
            restrict: 'A',
            priority: Number.MIN_SAFE_INTEGER, // execute last, after all other directives if any.
            link: function($scope, $element, $attributes) {
                var expressions = $attributes.whenReady.split(';');
                var waitForInterpolation = false;
                var hasReadyCheckExpression = false;

                function evalExpressions(expressions) {
                    expressions.forEach(function(expression) {
                        $scope.$eval(expression);
                    });
                }

                if ($attributes.whenReady.trim().length === 0) { return; }

                if ($attributes.waitForInterpolation && $scope.$eval($attributes.waitForInterpolation)) {
                    waitForInterpolation = true;
                }

                if ($attributes.readyCheck) {
                    hasReadyCheckExpression = true;
                }

                if (waitForInterpolation || hasReadyCheckExpression) {
                    requestAnimationFrame(function checkIfReady() {
                        var isInterpolated = false;
                        var isReadyCheckTrue = false;

                        if (waitForInterpolation && $element.text().indexOf($interpolate.startSymbol()) >= 0) { // if the text still has {{placeholders}}
                            isInterpolated = false;
                        }
                        else {
                            isInterpolated = true;
                        }

                        if (hasReadyCheckExpression && !$scope.$eval($attributes.readyCheck)) { // if the ready check expression returns false
                            isReadyCheckTrue = false;
                        }
                        else {
                            isReadyCheckTrue = true;
                        }

                        if (isInterpolated && isReadyCheckTrue) { evalExpressions(expressions); }
                        else { requestAnimationFrame(checkIfReady); }

                    });
                }
                else {
                    evalExpressions(expressions);
                }
            }
        };
    }]);

angular
    .module('nomumo')
    .directive('focusOnShow', function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attr) {
                if ($attr.ngShow){
                    $scope.$watch($attr.ngShow, function(newValue){
                        if(newValue){
                            $timeout(function(){
                                $element[0].focus();
                            }, 0);
                        }
                    })
                }
                if ($attr.ngHide){
                    $scope.$watch($attr.ngHide, function(newValue){
                        if(!newValue){
                            $timeout(function(){
                                $element[0].focus();
                            }, 0);
                        }
                    })
                }

            }
        };
    })