angular.module('lookin4.factory', [])
    .factory('PushWoosh', function($q, $http) {
        return {
            registerPushwooshAndroid: function() {
                var deferred = $q.defer();
                var pushNotification = window.plugins.pushNotification;

                //set push notifications handler
                document.addEventListener('push-notification',
                    function(event) {
                        var title = event.notification.title;
                        var message = event.notification.message;
                        var userData = event.notification.userdata;

                        if (typeof(userData) != "undefined") {
                            console.warn('user data: ' + JSON.stringify(userData));
                        }
                    }
                );

                //initialize Pushwoosh with projectid: "GOOGLE_PROJECT_ID", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
                pushNotification.onDeviceReady({
                    projectid: "922706522961",
                    appid: "BEA10-90C8D"
                });

                //register for push notifications
                pushNotification.registerDevice(deferred.resolve, deferred.reject);
                return deferred.promise;
            },

            registerPushwooshIOS: function() {
                var deferred = $q.defer();
                var pushNotification = window.plugins.pushNotification;

                //set push notification callback before we initialize the plugin
                document.addEventListener('push-notification',
                    function(event) {
                        //get the notification payload
                        var notification = event.notification;
                        //display alert to the user for example
                        alert(notification.aps.alert);
                        pushNotification.setApplicationIconBadgeNumber(0);
                    }
                );
                //initialize the plugin
                pushNotification.onDeviceReady({
                    pw_appid: "BEA10-90C8D"
                });

                //register for pushes
                pushNotification.registerDevice(deferred.resolve, deferred.reject);

                //reset badges on start
                pushNotification.setApplicationIconBadgeNumber(0);
                return deferred.promise;
            },

            notification: function(fromUserName, deviceToken, toUserName, content) {
                console.log("notification about to be sent");
                data = {
                    "request": {
                        "application": "BEA10-90C8D",
                        "auth": "GdLSgfqFonfjbYjiZArVIYW22eM1rmG6TTV97IMStx8V4AdEzQu7y5quv5jXQdVt3oiqjyYYSOARpUyTjNJJ",
                        "notifications": [{
                            "send_date": "now",
                            "ignore_user_timezone": true,
                            "content": {
                                "en": content
                            },
                            "link": "",
                            "data": {

                            },
                            "platforms": [3],
                            "android_root_params": {
                                "key": "value"
                            },
                            "android_icon": "icon",
                            "android_vibration": 0,
                            "android_led": "#000000",

                            "devices": [deviceToken]
                        }]
                    }
                };
                return $http({
                    url: "https://cp.pushwoosh.com/json/1.3/createMessage",
                    method: "POST",
                    data: data
                })
            }
        }
    })

.factory('GigAPI', function($http) {
    var base = "http://lookin4.herokuapp.com/api/gigs"
    return {
        all: function(userID) {
            return $http({
                url: base + "/feed",
                method: "POST",
                data: {
                    userID: userID
                }
            })
        },
        allfeed: function(userID) {
            return $http({
                url: base + "/allfeed",
                method: "POST",
                data: {
                    userID: userID
                }
            })
        },
        personal: function(userID) {
            return $http({
                url: base + "/personal",
                method: "POST",
                data: {
                    userID: userID
                }
            })
        },
        new: function(userid, name, date, position, rate, description) {
            return $http({
                url: base + "/new",
                method: "POST",
                data: {
                    userID: userid,
                    name: name,
                    date: date,
                    position: position,
                    rate: rate,
                    description: description
                },
            })
        },
        interested: function(userid, transactionid) {
            return $http({
                url: base + "/interested",
                method: "POST",
                data: {
                    userID: userid,
                    transactionID: transactionid
                }
            })
        },
        notInterested: function(userid, transactionid) {
            return $http({
                url: base + "/notInterested",
                method: "POST",
                data: {
                    userID: userid,
                    transactionID: transactionid
                }
            })
        },
        getInterested: function(transactionid) {
            return $http({
                url: base + "/getInterested",
                method: "POST",
                data: {
                    transactionID: transactionid
                }
            })
        },
        update: function(_id, hidden) {
            return $http({
                url: base + "/update",
                method: "POST",
                data: {
                    _id: _id,
                    hidden: hidden
                }
            })
        },
        flagged: function(_id, hidden, flagged, userFlaggedReason) {
            return $http({
                url: base + "/flagged",
                method: "POST",
                data: {
                    _id: _id,
                    hidden: hidden,
                    flagged: flagged,
                    $push: {
                        flaggedReason: userFlaggedReason
                    }
                }
            })
        }
    }
})

.factory('UserAPI', function($http) {
    var base = "http://lookin4.herokuapp.com/api/users"
    return {
        new: function(userID, name, email) {
            return $http({
                url: base + "/new",
                method: "POST",
                data: {
                    userID: userID,
                    name: name,
                    email: email
                }
            })
        },
        get: function(userID) {
            return $http({
                url: base + "/get",
                method: "POST",
                data: {
                    userID: userID
                }
            })
        },
        update: function(userid, phone, caption) {
            return $http({
                url: base + "/update",
                method: "POST",
                data: {
                    userID: userid,
                    phone: phone,
                    caption: caption
                },
            })
        },
        updateToken: function(userid, deviceToken) {
            return $http({
                url: base + "/updateToken",
                method: "POST",
                data: {
                    userID: userid,
                    deviceToken: deviceToken
                }
            })
        }
    }
})
