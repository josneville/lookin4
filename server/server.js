var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');

app.set('port', process.env.PORT || '5000');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/www"));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
mongoose.connect("mongodb://josneville:bananaman@ds041861.mongolab.com:41861/heroku_app33821378");

//mongoose.connect("localhost");
var gigSchema = new Schema({
  userid: {type: String, required: true},
  name: {type: String, required: true},
	position: {type: String, required: true},
	rate: {type: Number, required: true},
	date: {type: Date, required: true},
  description: {type: String, required: true},
  interested: {type: Array, default: []},
	notInterested: {type: Array, default: []}
}, {versionKey:false});

var userSchema = new Schema({
  userid: {type: String, required: true},
  name: {type: String, required: true},
  email: {type: String, required: true},
  phone: {type: Number},
  caption: {type: String}
}, {versionKey: false});


var Gig = mongoose.model('Gig', gigSchema);
var User = mongoose.model('FbUser', userSchema);

app.post('/api/users/new', function(req, res){
  var postID = req.body.userID;
  var postName = req.body.name;
  var postEmail = req.body.email;
  User.findOne({userid: postID}, function(err, user){
    if (err || user == null){
      var newUser = new User({
        userid: postID,
        name: postName,
        email: postEmail
      })
      newUser.save(function(err, nUser){
        if (err){
          res.status(400).send("Unknown Error");
          return;
        }
        res.status(200).send("New User Created");
      })
    }
    else{
      res.status(200).send("User found");
    }
  })
});

app.post('/api/users/get', function(req, res){
  var postID = req.body.userID;
  User.findOne({userid: postID}, function(err, user){
    if (err || user == null){
      res.status(400).send("Unknown Error");
      return;
    }
    res.status(200).send(user);
  });
});

app.post('/api/users/update', function(req, res){
  var postCaption = req.body.caption;
  var postPhone = req.body.phone;
  var postID = req.body.userID;
  User.update({userid: postID}, {caption: postCaption, phone: postPhone}, {}, function(err, numUpdated){
    if (err){
			console.log(err);
      res.status(400).send("Fail");
      return;
    }
    res.status(200).send("Success");
  });
});

app.post('/api/gigs/feed', function(req, res){
  var postID = req.body.userID;
  Gig.aggregate([
      {$match: {userid: {$ne: postID}, interested: {$nin: [postID]}, notInterested: {$nin: [postID]}}},
      {$project: {
        _id: 1,
		userid: 1,
        name: 1,
        position: 1,
        rate: 1,
        date: 1,
        description: 1
      }}
    ], function(err, gigs){
      if (err) {
        res.status(400).send("Unknown Error");
        return;
      }
	  console.log(gigs);
      res.status(200).send(gigs);
  })
});

app.post('/api/gigs/personal', function(req, res){
  var postID = req.body.userID;
  Gig.aggregate([
      {$match: {userid: postID}},
      {$project: {
        _id: 1,
				userid: 1,
        name: 1,
        position: 1,
        rate: 1,
        date: 1,
        description: 1,
        interested: 1
      }}
    ], function(err, gigs){
      if (err) {
        res.status(400).send("Unknown Error");
        return;
      }
      res.status(200).send(gigs);
  })
});

app.post('/api/gigs/new', function(req, res){
  var postID = req.body.userID;
  var postName = req.body.name;
  var postPosition = req.body.position;
  var postRate = req.body.rate;
  var postDescription = req.body.description;
  var postDate = req.body.date;
  var newGig = new Gig({
    userid: postID,
    name: postName,
    position: postPosition,
    rate: postRate,
    description: postDescription,
    date: postDate
  });
  newGig.save(function(err, nU){
    if(err){
      res.status(400).send("Unknown Error");
      return;
    }
    res.status(200).send("Sucess");
  })
});

app.post('/api/gigs/interested', function(req, res){
	var postID = req.body.userID;
	var transactionID = req.body.transactionID;
	Gig.update({_id: transactionID}, {$push: {interested: postID}}, function(err, transaction){
		if (err || transaction == null){
			console.log(err);
			res.status(400).send("Unknown Error");
			return;
		}
		res.status(200).send("Interest Recorded");
	});
});

app.post('/api/gigs/notInterested', function(req, res){
	var postID = req.body.userID;
	var transactionID = req.body.transactionID;
	Gig.update({_id: transactionID}, {$push: {notInterested: postID}}, function(err, transaction){
		if (err || transaction == null){
			console.log(err);
			res.status(400).send("Unknown Error");
			return;
		}
		res.status(200).send("Not Interest Recorded");
	});
});

app.post('/api/gigs/getInterested', function(req, res){
	var postTransactionID = req.body.transactionID;
	Gig.findOne({_id: postTransactionID}, function(err, transaction){
		if(err || transaction == null){
			res.status(400).send("Unknown Error");
			return;
		}
		User.find({userid: {$in: transaction.interested}}, function(err, users){
			if (err || users == null){
				res.status(400).send("Unknown Error");
				return;	
			}
			res.status(200).send(users);
		});
	});
});

app.listen(app.get('port'));
