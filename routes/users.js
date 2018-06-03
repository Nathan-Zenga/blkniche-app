var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	bcrypt = require('bcryptjs'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	Grid = require('gridfs-stream'),
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
router.post('/register', function(req, res) {
	User.find(function(err, docs) { // preparing for comparison querying
		var errData = {};

		// for dynamic page rendering and redirection, only upon error detection
		var page = title = req.params.title;
		page == 'Home' ? page = 'index' : null;

		// Validation
		req.checkBody('firstName', 'First name').notEmpty();
		req.checkBody('lastName', 'Last name').notEmpty();
		req.checkBody('email', 'Email').notEmpty();
		if(req.body.email) req.checkBody('email', 'Must be an email address').isEmail();
		req.checkBody('username', 'Username').notEmpty();
		req.checkBody('username', 'Username: no spaces or special characters allowed (except "." and "-").')
			.custom(value => {
				var chars = /[ !@#$£%^&*()+\=\[\]{};':"\\|,<>\/?]/;
				return chars.test(value) == false;
			});
		req.checkBody('DOB', 'Date of birth').notEmpty();
		req.checkBody('nationality', 'Nationality').notEmpty();
		req.checkBody('password', 'Password').notEmpty();
		req.checkBody('passwordConfirm', 'Confirmed password not the same.').equals(req.body.password);

		// Validating field uniqueness
		req.checkBody('username', 'Username already used').custom(value => {
			var exists = false;
			for (var i = 0; i < docs.length; i++) {
				if (value === docs[i].username) {
					exists = true
				}
			}
			return !exists
		});
		req.checkBody('email', 'Email already used').custom(value => {
			var exists = false;
			for (var i = 0; i < docs.length; i++) {
				if (value === docs[i].email) {
					exists = true
				}
			}
			return !exists
		});

		var errors = req.validationErrors();

		if(errors) {
			var missingFieldErrors = [];
			var otherErrs = [];
			errors.forEach(err => {
				if (/characters|address|already used/.test(err.msg) || err.param == 'passwordConfirm') {
					otherErrs.push(err.msg)
				} else {
					missingFieldErrors.push(err.msg.toLowerCase())
				}
			});

			if (missingFieldErrors.length) {
				if (missingFieldErrors.length > 1) {
					var lastIndex = missingFieldErrors.length-1;
					lastIndex = " and " + missingFieldErrors[lastIndex];
					missingFieldErrors = missingFieldErrors.slice(0, -1).join(', ') + lastIndex;
				}
				req.flash('login_error', 'Please fill in your ' + missingFieldErrors + '.');
				errData.login_error = req.flash('login_error');
			}
			if (otherErrs.length) {
				errData.login_error_chars = [];
				otherErrs.forEach(err => {
					// req.flash('login_error_chars', err);
					errData.login_error_chars.push(err);
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
			errData.success_msg = req.flash('success_msg');
		}

		res.send(errData);
	});
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
router.delete('/delete', function(req, res) {

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

router.post('/update', function(req, res) {

	// prepare objects for update operation
	var updates = {};
	var saveUpdates = (updates, hash) => {
		if (updates) {
			if (hash) updates.password = hash;
			User.update({ _id: req.user._id }, { $set: updates }, (err, result) => {
				if (err) return err;
				User.find({ _id: req.user._id }, function(err, doc) {
					if (err) return err;
					// preparing data for AJAX callback
					var updated = {
						name: doc[0].firstName + " " + doc[0].lastName,
						email: doc[0].email,
						DOB: doc[0].DOB.getDate() + '/' + (doc[0].DOB.getMonth()+1) + '/' + doc[0].DOB.getFullYear(),
						nationality: doc[0].nationality
					};
					res.send(updated);
				});
			});
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
		var result = '';
		if (!req.body.old_password) {
			req.flash('update_error','Please fill in your old password.');
			result += req.flash('update_error');
			res.write(result);
			res.end();
		} else {
			User.comparePassword(req.body.old_password, req.user.password, function(err, isMatch){
				if(err) throw err;
				if(!isMatch){
					req.flash('update_error','Incorrect password.');
					result += req.flash('update_error');
					res.write(result);
					res.end();
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