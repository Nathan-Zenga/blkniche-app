var fs = require('fs'),
	express = require('express'),
	router = express.Router(),
	bcrypt = require('bcrypt'),
	passport = require('passport'),
	config = JSON.parse(fs.readFileSync('config/config.json'));

// Connection string - paramaters ('db', ['collection'])
// var db = mongojs(config.db, ['customers']);
// var ObjectId = mongojs.ObjectId;
let Customer = require('../models/customer'); // import the model

// Load profile page
router.get('/', function(req, res) {
	Customer.find(function(err, docs){

		// render the page, with data passed into templates
		res.render('profile', {
			title: 'Profile',
			pageName: 'profile',
			customers: docs
		});

	});
});


module.exports = router;