angular.module('lookin4.factory', [])

.factory('GigAPI', function($http){
  var base = "http://lookin4.herokuapp.com/api/gigs"
  return {
    all: function(userID){
      return $http({
        url: base + "/feed",
        method: "POST",
        data: {userID: userID}
      })
    },
    all: function(userID){
      return $http({
        url: base + "/allfeed",
        method: "POST",
        data: {userID: userID}
      })
    },
    personal: function(userID){
      return $http({
        url: base + "/personal",
        method: "POST",
        data: {userID: userID}
      })
    },
    new: function(userid, name, date, position, rate, description) {
      return $http({
        url: base + "/new",
        method: "POST",
        data: {userID: userid, name: name, date: date, position: position, rate: rate, description: description},
      })
    },
		interested: function(userid, transactionid){
			return $http({
				url: base + "/interested",
				method: "POST",
				data: {userID: userid, transactionID: transactionid}
			})
		},
    notInterested: function(userid, transactionid){
      return $http({
        url: base + "/notInterested",
        method: "POST",
        data: {userID: userid, transactionID: transactionid}
      })
    },
    getInterested: function(transactionid){
      return $http({
        url: base + "/getInterested",
        method: "POST",
        data: {transactionID: transactionid}
      })
    },
    update: function(_id, hidden) {
      return $http({
        url: base + "/update",
        method: "POST",
        data: {_id: _id, hidden: hidden}
      })
    },
    flagged: function(_id, hidden, flagged, userFlaggedReason) {
      return $http({
        url: base + "/flagged",
        method: "POST",
        data: {_id: _id, hidden: hidden, flagged: flagged, $push: {flaggedReason: userFlaggedReason}}
      })
    }
  }
})

.factory('UserAPI', function($http){
  var base = "http://lookin4.herokuapp.com/api/users"
  return {
    new: function(userID, name, email){
      return $http({
        url: base + "/new",
        method: "POST",
        data: {userID: userID, name: name, email: email}
      })
    },
    get: function(userID){
      return $http({
        url: base + "/get",
        method: "POST",
        data: {userID: userID}
      })
    },
    update: function(userid, phone, caption) {
      return $http({
        url: base + "/update",
        method: "POST",
        data: {userID: userid, phone: phone, caption: caption},
      })
    }
  }
})
