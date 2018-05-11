var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	bcrypt = require('bcryptjs'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	Grid = require('gridfs-stream'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('../models/user'),
	gfsRemove = require('../config/config').gfsRemove;

let conn = mongoose.connection;
let gfs; // init gfs

// Check connection
conn.once('open', function() {
	// init stream
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('profile_icons');
});

// Register new user
router.post('/register', function(req, res){

	var login_error = '';
	var login_error_chars = '';
	var success_msg = '';

	// for dynamic page rendering and redirection, only upon error detection
	var page = title = req.params.title;
	page == 'Home' ? page = 'index' : null;

	// Validation
	req.checkBody('firstName', 'First name').notEmpty();
	req.checkBody('lastName', 'Last name').notEmpty();
	req.checkBody('email', 'Email').notEmpty();
	req.checkBody('username', 'Username').notEmpty();
	req.checkBody('username', 'Username: no spaces or special characters allowed (except "." and "-").')
		.custom((value) => {
			var chars = /[ !@#$£%^&*()+\=\[\]{};':"\\|,<>\/?]/;
			return chars.test(value) == false;
		});
	req.checkBody('DOB', 'Date of birth').notEmpty();
	req.checkBody('nationality', 'Nationality').notEmpty();
	req.checkBody('password', 'Password').notEmpty();
	req.checkBody('passwordConfirm', 'Confirmed password not the same.').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		var errList = [];
		var otherErrs = [];
		errors.forEach(err => {
			if (err.msg.includes('characters') || err.param == 'passwordConfirm') {
				otherErrs.push(err.msg)
			} else {
				errList.push(err.msg.toLowerCase())
			}
		});

		if (errList.length > 1) {
			var lastIndex = errList.length-1;
			lastIndex = " and " + errList[lastIndex];
			errList = errList.slice(0, -1).join(', ') + lastIndex;
		}

		if (errList.length) {
			req.flash('login_error', 'Please fill in your ' + errList + '.');
			login_error += req.flash('login_error') + ' ... ';
		}
		if (otherErrs.length) {
			otherErrs.forEach(err => {
				req.flash('login_error_chars', err);
				login_error_chars += req.flash('login_error_chars') + ' ... ';
			})
		}

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
		});

		req.flash('success_msg', 'You are registered and can now login');
		success_msg += req.flash('success_msg');
	}

	res.write(login_error);
	res.write(login_error_chars);
	res.write(success_msg);
	res.end();
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


// Account Deletion process
router.delete('/delete/:id', function(req, res) {

	User.comparePassword(req.body.password, req.user.password, function(err, isMatch){
		if(err) throw err;
		if(!isMatch){
			req.flash('error_msg','Incorrect password.');
			return res.redirect(req.get('referer'));
		} else {
			// remove custom icon before deleting account
			gfsRemove(req, res, gfs, null, User);
		}
	});
});

router.post('/update/:id', function(req, res) {

	// prepare objects for update operation
	var updates = {};
	var saveUpdates = (updates, hash) => {
		if (updates) {
			if (hash) updates.password = hash;
			User.update({
				_id: req.params.id
			},
			{
				$set: updates
			},
			(err, result) => {
				if (err) { 
					console.log(err);
				}
			});
			res.redirect(req.get('referer'));
		}
	}

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

	if (req.body.new_password) {
		if (!req.body.old_password) {
			req.flash('error_msg','Please fill in your old password.');
			res.redirect(req.get('referer'));
		} else {
			User.comparePassword(req.body.old_password, req.user.password, function(err, isMatch){
				if(err) throw err;
				if(!isMatch){
					req.flash('error_msg','Incorrect password.');
					res.redirect(req.get('referer'));
				} else {
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(req.body.new_password, salt, function(err, hash) {
							// save new password
							saveUpdates(updates, hash);
						});
					});
				}
			});
		}
	} else {
		// update document fields
		saveUpdates(updates);
	}
});


module.exports = router;