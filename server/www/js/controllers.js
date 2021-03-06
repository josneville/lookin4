angular.module('lookin4.controllers', [])
    .controller('LoginCtrl', function($scope, $ionicPopup, $location, $rootScope) {
        $scope.fbLogin = function() {
            $scope.popUpRes = false;
            var confirmPopup = $ionicPopup.confirm({
                title: 'Facebook',
                template: 'Lookin4 will receive the following info: your name and email address.'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    openFB.login(
                        function(response) {
                            if (response.status === 'connected') {
                                console.log(response);
                                console.log($scope);

                                $scope.$apply(function() {
                                    $location.path('/app/search');
                                });
                            } else {
                                $scope.$apply(function() {
                                    $location.path('/login');
                                });
                            }
                        }, {
                            scope: 'email'
                        });
                } else {
                    console.log("don't show login page");
                }
            });

            openFB.getLoginStatus(function(loginStatus) {
                console.log(loginStatus);
                if (loginStatus.status === 'connected') {
                    $location.path('/app/search');
                }
            })
        }
    })

.controller('MainCtrl', function($scope, $location, $rootScope, GigAPI, UserAPI) {
    $scope.hideNew = function() {
        return $location.path() === '/app/newgig'
    };
    $scope.isLoading = true;
    $scope.loading = function() {
        return $scope.isLoading
    };
    $scope.logout = function() {
        openFB.logout(function() {
            $location.path('/login');
        });
    }
    $scope.newgig = function() {
        $location.path('/app/newgig');
    }
})

.controller('FeedCtrl', function($scope, $ionicPopup, GigAPI, PushWoosh, UserAPI) {

    $scope.registerDeviceForNotification = function(userID) {
        console.log(userID);
        if (window.ionic.Platform.isAndroid()) {
            PushWoosh
                .registerPushwooshAndroid()
                .then(function(result) {
                    console.log(result);
                    $scope.updateProfile(userID, result);
                });
        }
        if (window.ionic.Platform.isIOS()) {
            PushWoosh
                .registerPushwooshIOS()
                .then(function(result) {
                    console.log(result);
                    $scope.updateProfile(userID, result);
                });
        }

        $scope.updateProfile = function(userID, deviceToken) {
            console.log(deviceToken);
            UserAPI.updateToken(userID, deviceToken)
                .success(function(data, status, headers, config) {
                    console.log("success");
                })
                .error(function(data, status, headers, config) {
                    console.log("token not updated");
                });
        }
    }

    $scope.check = false;
    $scope.userFlaggedReason = ' ';
    $scope.showCheck = function() {
        return $scope.check
    };
    $scope.interested = function(tID, gigOwnerID) {
        console.log("interested" + " " + tID + " " + gigOwnerID)
        UserAPI.get(gigOwnerID)
            .success(function(data, status, headers, config) {
                console.log($scope.user.name + " " + data.deviceToken + " " + data.name + " " + $scope.user.name);
                PushWoosh.notification($scope.user.name, data.deviceToken, data.name, $scope.user.name + " is interested in your gig!")
                    .success(function(data, status, headers, config) {
                        console.log("notification sent");
                    })
                    .error(function(data, status, headers, config) {
                        console.log(data);
                    });
            });
        GigAPI.interested($scope.user.id, tID)
            .success(function(data, status, headers, config) {
                $scope.check = true;
                setTimeout(
                    function() {
                        $('#check').css('stroke-dashoffset', 0);
                    }, 1);
                $scope.getFeed();
                setTimeout(
                    function() {
                        $('#check').css('stroke-dashoffset', 130);
                        $scope.$apply(function() {
                            $scope.check = false;
                        });
                    }, 2000);
            })
    }
    $scope.notInterested = function(tID) {
        GigAPI.notInterested($scope.user.id, tID)
            .success(function(data, status, headers, config) {
                $scope.getFeed();
            });
    }
    $scope.getDescription = function(description, tID, hidden, flagged) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Description',
            template: description,
            okText: 'Report' // String (default: 'OK'). The text of the OK button.
        });
        confirmPopup.then(function(res) {
            if (res) {
                $scope.flagGig(tID, hidden, flagged);
            }
        });
    }

    $scope.flagGig = function(tID, hidden, flagged) {
        $scope.data = {}

        var flagPopup = $ionicPopup.show({
            title: 'Flag and report Gig',
            template: '<input type="text" ng-model="data.userFlaggedReason">',
            subTitle: 'Please explain why',
            scope: $scope,
            buttons: [{
                text: 'Cancel'
            }, {
                text: '<b>Report</b>',
                type: 'button-positive',
                onTap: function(e) {

                    if (!$scope.data.userFlaggedReason) {
                        return ' ';
                    } else {
                        return $scope.data.userFlaggedReason;
                    }


                }
            }]
        });

        flagPopup.then(function(res) {
            if (typeof res === 'undefined')
                return;
            console.log(res);
            GigAPI.flagged(tID, hidden, flagged, "res")
                .success(function(data, status, headers, config) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Gig reported'
                    });
                    $scope.notInterested(tID);

                })
                .error(function(data, status, headers, config) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Mistyped information'
                    });
                });

        });


    }

    openFB.getLoginStatus(function(loginStatus) {
        if (loginStatus.status !== 'connected') {
            $location.path('/login');
        } else {
            openFB.api({
                path: '/me',
                success: function(user) {
                    /** if(user.deviceToken == '' ){
                       $scope.registerDeviceForNotification(user.id);
                     }**/
                    UserAPI.new(user.id, user.name, user.email)
                        .success(function(data, headers, config, status) {
                            $scope.$parent.$parent.$parent.isLoading = false;
                            $scope.user = user;
                            $scope.getFeed();
                            $scope.$parent.$parent.$parent.user = $scope.user;
                        })
                        .error(function(data, headers, config, status) {
                            $location.path('/login');
                        })
                },
                error: function() {
                    $location.path('/login');
                }
            });
        }
    })

    $scope.getFeed = function() {
        UserAPI.get($scope.user.id).success(function(data, status, headers, config) {
            console.log(data.deviceToken);
            if (typeof data.deviceToken === 'undefined') {
                $scope.registerDeviceForNotification($scope.user.id);
            }
        });
        GigAPI.all($scope.user.id).success(function(data, status, headers, config) {
            console.log(data);
            $scope.feed = data;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }
})

.controller('NewGigCtrl', function($scope, $location, $ionicPopup, GigAPI) {
    var firstDay = new Date();
    var nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    $scope.currentNewGig = {
        rate: 100,
        position: "Photographer",
        date: nextWeek
    }
    $scope.postGig = function() {
        GigAPI.new($scope.$parent.$parent.$parent.user.id, $scope.$parent.$parent.$parent.user.name, $scope.currentNewGig.date, $scope.currentNewGig.position, $scope.currentNewGig.rate, $scope.currentNewGig.description)
            .success(function(data, status, headers, config) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Your gig has been posted'
                });
                alertPopup.then();
                $location.path('/app/search');
            })
            .error(function(data, status, headers, config) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Not enough parameters'
                });
                alertPopup.then();
            });
    }
})

.controller('ProfileCtrl', function($scope, $location, $ionicPopup, UserAPI) {
    $scope.user = $scope.$parent.user;
    if (!$scope.user.caption) {
        $scope.user.caption = "";
    }
    if (!$scope.user.phone) {
        $scope.user.phone = "";
    }
    $scope.updateProfile = function() {
        console.log($scope.user.caption);
        UserAPI.update($scope.user.id, $scope.user.phone, $scope.user.caption)
            .success(function(data, status, headers, config) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Your profile has been updated'
                });
                alertPopup.then();
            })
            .error(function(data, status, headers, config) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Mistyped information'
                });
                alertPopup.then();
            });
    }
})

.controller('MyGigsCtrl', function($scope, $location, GigAPI) {
    $scope.getPersonal = function() {
        GigAPI.personal($scope.$parent.$parent.$parent.user.id)
            .success(function(data, headers, config, status) {
                $scope.personal = data;
                $scope.$broadcast('scroll.refreshComplete');
            })
    }
    $scope.findInterested = function(id, len) {
        if (len > 0) {
            $location.path("/app/interested").search("id", id);
        }
    }
    $scope.getPersonal();
})

.controller('InterestedCtrl', function($scope, $location, GigAPI) {
    $scope.id = $location.search()["id"];
    if (!$scope.id) {
        $location.path("/app/gigs");
    }
    $scope.getInterested = function() {
        GigAPI.getInterested($scope.id)
            .success(function(data, headers, config, status) {
                $scope.interested = data;
                $scope.$broadcast('scroll.refreshComplete');
            })
    }
    $scope.getInterested();
});