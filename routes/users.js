var fs = require('fs'),
	express = require('express'),
	router = express.Router(),
	mongojs = require('mongojs'),
	bcrypt = require('bcrypt'),
	passport = require('passport'),
	flash = require('connect-flash'),
	config = JSON.parse(fs.readFileSync('config/config.json'));

// Connection string - paramaters ('db', ['collection'])
// var db = mongojs(config.db, ['customers']);
var ObjectId = mongojs.ObjectId;
let Customer = require('../models/customer'); // import the model


// sending new customer data to server
router.post('/add/:title/:pageName', function(req, res) {

	var title = req.params.title,
		pageName = req.params.pageName;

	console.log();
	console.log("REQ PARAMS:", req.params);

	// Signify required input; checking if any of them is not empty
	req.checkBody('firstName', 'First name').notEmpty();
	req.checkBody('lastName', 'Last name').notEmpty();
	req.checkBody('email', 'Email').notEmpty();
	req.body.DOB ? req.checkBody('DOB', 'Date of birth').notEmpty() : req.checkBody(['day', 'month', 'year'], 'Date of birth').notEmpty();
	req.checkBody('nationality', 'Nationality').notEmpty();
	req.checkBody('password', 'Password').notEmpty();
	req.checkBody('passwordConfirm', 'Confirmed password not the same').equals(req.body.password);

	var errors = req.validationErrors();
	
	// Check if errors present, else create object from user's input + insert to database
	if (errors) {
		Customer.find(function(err, docs){
			res.render(pageName, {
				title: title,
				pageName: pageName,
				customers: docs,
				errors: errors
			});
		});
	} else {
		var newUser = new Customer({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			DOB: req.body.DOB,
			nationality: req.body.nationality,
			password: req.body.password
		});

		if (req.body.DOB === undefined) {
			newUser.DOB = req.body.year + "-" + req.body.month + "-" + req.body.day;
		}

		const salt = 10;

		bcrypt.hash(newUser.password, salt, function(err, hash){
			if (err) {
				console.log(err);
			}
			newUser.password = hash;
			newUser.save(function(err){
				if (err) {
					console.log(err);
					return;
				} else {
					Customer.find(function(err, docs){
						req.flash('success', 'Now registered!');
						console.log(docs)
					});
				}
				res.redirect(req.get('referer'));
			});

			// // insert new user to db collection
			// db.customers.insert(newUser, function(err, result){
			// 	if(err) {
			// 		console.log("ERROR: " + err);
			// 	} else {
			// 		db.customers.find(function(err, docs){
			// 			console.log(docs)
			// 		});
			// 	}
			// 	// reload current page
			// 	res.redirect(req.get('referer'));
			// });
		});
	}
});

router.delete('/delete/:id', function(req, res) {
	// console.log(req.params.id);
	db.customers.remove({
		_id: ObjectId(req.params.id)
	}, function(err, result) {
		if (err) { 
			console.log(err);
		}
	});
});

router.post('/update/:id', function(req, res) {

	// prepare object for update operation
	var updates = {};

	// checking for values in body, in which case they are added to the object
	if (req.body.firstName_update)		updates.firstName = req.body.firstName_update;
	if (req.body.lastName_update)		updates.lastName = req.body.lastName_update;
	if (req.body.email_update)			updates.email = req.body.email_update;
	if (req.body.nationality_update)	updates.nationality = req.body.nationality_update;

	if (req.body.DOB_update !== '' && req.body.DOB_update !== undefined) { // check if field exists
		updates.DOB = new Date(req.body.DOB_update)
	} else if (req.body.year_update && req.body.month_update && req.body.day_update) { // assuming these fields exist, check for no empty strings
		updates.DOB = new Date(req.body.year_update + "-" + req.body.month_update + "-" + req.body.day_update)
	}

	console.log(req.body);

	// update document fields
	Customer.update({
		_id: ObjectId(req.params.id)
	},
	{
		$set: updates
	},
	function(err, result) {
		if (err) { 
			console.log(err);
		} else {
			// log latest update
			Customer.find({ _id: ObjectId(req.params.id) }, function(err, docs){
				console.log(docs)
			});
		}
		res.redirect(req.get('referer'));
	});
});

// Login process
router.post('/login', function(req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: req.get('referer'),
		failureFlash: true
	})(req, res, next);
});

router.get('/logout', function(){
	req.logout();
	req.flash('success', 'You are logged out');
	res.redirect('/');
});


module.exports = router;