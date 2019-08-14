var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	bcrypt = require('bcryptjs'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	Grid = require('gridfs-stream'),
	auth = require('../config/config').ensureAuthenticated,
	User = require('../models/user'),
	Post = require('../models/post'),
	clearance = require('../config/config').clearance;

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
		var msgs = {};

		// for dynamic page rendering and redirection, only upon error detection
		var page = title = req.params.title;
		page == 'Home' ? page = 'index' : null;

		// Validation
		req.checkBody('username', 'Username: no spaces or special characters allowed (except "." and "-").').custom(value => {
			let chars = /[ !@#$£%^&*()+\=\[\]{};':"\\|,<>\/?]/;
			return chars.test(value) == false;
		});
		req.checkBody('DOB', 'Date of birth: invalid format').custom(value => {
			let format = /^\d{4}-\d{2}-\d{2}$/i;
			return format.test(value)
		});
		req.checkBody('passwordConfirm', 'Confirmed password not the same.').equals(req.body.password);

		// Validating field uniqueness
		var findValue = (value, field) => {
			let exists = false;
			for (var i = 0; i < docs.length; i++) {
				if (value === docs[i][field]) {
					exists = true
				}
			}
			return !exists
		}
		req.checkBody('username', 'Username already used').custom(value => { return findValue(value, "username") });
		req.checkBody('email', 'Email already used').custom(value => { return findValue(value, "email") });

		var errors = req.validationErrors();

		if(errors) {
			var missingFieldErrors = [];
			var otherErrs = [];
			errors.forEach(err => {
				if (/characters|address|already used|format/.test(err.msg) || err.param == 'passwordConfirm') {
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
				msgs.login_error = req.flash('login_error');
			}
			if (otherErrs.length) {
				msgs.login_error_chars = [];
				otherErrs.forEach(err => {
					// req.flash('login_error_chars', err);
					msgs.login_error_chars.push(err);
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
			msgs.success_msg = req.flash('success_msg');
		}

		res.send(msgs);
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
router.delete('/delete', auth, function(req, res) {

	User.comparePassword(req.body.password, req.user.password, function(err, isMatch){
		if(err) throw err;
		if(!isMatch){
			req.flash('error_msg','Incorrect password.');
			return res.redirect(req.get('referer'));
		} else {
			// remove custom icon before deleting account
			clearance(req, gfs, null, User, Post, function(err) {
				if (err) return err;
				req.flash('success_msg', 'Account successfully deleted');
				res.redirect('/');
			});
		}
	});
});

router.post('/update', auth, function(req, res) {

	// prepare objects for update operation
	var updates = {};
	var saveUpdates = (updates, hash) => {
		var length = 0; for (k in updates) length += 1;
		if (length) {
			if (hash) updates.password = hash;
			User.findById(req.user._id, (err, user) => {
				if (err) return err;
				for (k in updates) user[k] = updates[k];
				user.save(function(err){
					// preparing data for AJAX callback
					var updated = {
						name: user.firstName + " " + user.lastName,
						email: user.email,
						DOB: user.DOB.getDate() + '/' + (user.DOB.getMonth()+1) + '/' + user.DOB.getFullYear(),
						nationality: user.nationality,
						changed: length
					};
					res.send(updated);
				});
			});
		} else {
			res.end();
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
		var result = {};
		if (!req.body.old_password) {
			req.flash('update_error','Please fill in your old password.');
			result.error = req.flash('update_error');
			res.send(result);
		} else {
			User.comparePassword(req.body.old_password, req.user.password, function(err, isMatch){
				if(err) throw err;
				if(!isMatch){
					req.flash('update_error','Incorrect password.');
					result.error = req.flash('update_error');
					res.send(result);
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