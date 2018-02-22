var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Login
router.get('/login', function(req, res){
	User.find(function(err, docs){
		res.render('profile', {
			title: 'Profile',
			pageClass: 'profile',
			customers: docs
		});
	});
});

// Register new user
router.post('/register', function(req, res){

	// Validation
	req.checkBody('firstName', 'First name').notEmpty();
	req.checkBody('lastName', 'Last name').notEmpty();
	req.checkBody('email', 'Email').notEmpty();
	req.checkBody('username', 'Username').notEmpty();
	req.body.DOB ? req.checkBody('DOB', 'Date of birth').notEmpty() : req.checkBody(['day', 'month', 'year'], 'Date of birth').notEmpty();
	req.checkBody('nationality', 'Nationality').notEmpty();
	req.checkBody('password', 'Password').notEmpty();
	req.checkBody('passwordConfirm', 'Confirmed password not the same').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		User.find(function(err, docs){
			res.render('profile', {
				title: 'Profile',
				pageClass: 'profile',
				customers: docs,
				errors: errors
			});
		});
	} else {
		var newUser = new User({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			username: req.body.username,
			DOB: req.body.DOB,
			nationality: req.body.nationality,
			password: req.body.password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/users/login');
	}
});

// Passport config
require('../config/passport')(passport);

// Login process
router.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	}
);

// Logout process
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});


router.delete('/delete/:id', function(req, res) {
	// console.log(req.params.id);
	User.remove({
		_id: req.params.id
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
	if (req.body.username_update)		updates.username = req.body.username_update;
	if (req.body.nationality_update)	updates.nationality = req.body.nationality_update;

	if (req.body.DOB_update !== '' && req.body.DOB_update !== undefined) { // check if field exists
		updates.DOB = new Date(req.body.DOB_update)
	} else if (req.body.year_update && req.body.month_update && req.body.day_update) { // assuming these fields exist, check for no empty strings
		updates.DOB = new Date(req.body.year_update + "-" + req.body.month_update + "-" + req.body.day_update)
	}

	console.log(req.body);

	// update document fields
	User.update({
		_id: req.params.id
	},
	{
		$set: updates
	},
	function(err, result) {
		if (err) { 
			console.log(err);
		} else {
			// log latest update
			User.find({ _id: req.params.id }, function(err, docs){
				console.log(docs)
			});
		}
		res.redirect(req.get('referer'));
	});
});


module.exports = router;