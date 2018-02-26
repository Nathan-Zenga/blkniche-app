var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register new user
router.post('/register/:title', function(req, res){

	// for dynamic page rendering and redirection, only upon error detection
	var page = title = req.params.title;
	page == 'Home' ? page = 'index' : null;

	// Validation
	req.checkBody('firstName', 'First name is required').notEmpty();
	req.checkBody('lastName', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('username', 'Username must not contain spaces or special characters (except "." and "-")')
		.custom((value) => {
			var chars = /[ !@#$%^&*()+\=\[\]{};':"\\|,<>\/?]/;
			return chars.test(value) == false;
		});
	req.checkBody('DOB', 'Date of birth is required').notEmpty();
	req.checkBody('nationality', 'Nationality is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('passwordConfirm', 'Confirmed password not the same is required').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		User.find(function(err, docs){
			res.render(page.toLowerCase(), {
				title: title,
				pageClass: page.toLowerCase(),
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

		if (req.body.DOB === undefined) {
			newUser.DOB = req.body.year + "-" + req.body.month + "-" + req.body.day;
		}

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/');
	}
});

// Passport config
require('../config/passport')(passport);

// Login process
router.post('/login',
	passport.authenticate('local', {failureRedirect:'/',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	}
);

// Logout process
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/');
});


// Deletion process
router.delete('/delete/:id', function(req, res) {
	User.remove({
		_id: req.params.id
	}, function(err, result) {
		if (err) { 
			console.log(err); return;
		}
	});
});

router.get('/deleted', function(req, res) {
	req.flash('success_msg', 'Account successfully deleted');
	res.redirect('/');
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