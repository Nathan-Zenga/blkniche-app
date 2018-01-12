var fs = require('fs'),
	express = require('express'),
	router = express.Router(),
	mongojs = require('mongojs'),
	bcrypt = require('bcrypt'),
	passport = require('passport'),
	config = JSON.parse(fs.readFileSync('config/config.json'));

// Connection string:
// Paramaters ('db', ['collection'])
var db = mongojs(config.dbUri, ['customers']);
var ObjectId = mongojs.ObjectId;
// import the model


// Load profile page
router.get('/', function(req, res) {
	db.customers.find(function(err, docs){

		// render the page, with data passed into templates
		res.render('profile', {
			title: 'Profile /// BLK.NICHÈ',
			pageName: 'profile',
			customers: docs
		});

	});
});


module.exports = router;