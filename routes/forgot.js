var express = require('express'),
	router = express.Router(),
	User = require('../models/user'),
	async = require("async"),
	nodemailer = require("nodemailer"),
	bcrypt = require("bcryptjs"),
	crypto = require("crypto");

router.post('/forgot', function(req, res, next) {
	var msg = {};
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function(token, done) {
			User.findOne({ email: req.body.email }, function(err, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					msg.error = req.flash('error');
					return res.send(msg);
				}

				user.token = token;
				user.tokenExpiryDate = Date.now() + 3600000; // 1 hour

				user.save(function(err) {
					console.log(user);
					done(err, token, user);
				});
			});
		},
		function(token, user, done) {
			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'nathanzenga@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: 'nathanzenga@gmail.com',
				from: user.email,
				subject: 'Node.js Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/account/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			transporter.sendMail(mailOptions, function(err) {
				console.log('mail sent');
				req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
				msg.success = req.flash('success');
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
		res.send(msg);
	});
});

router.get('/reset/:token', function(req, res) {
	User.findOne({ token: req.params.token, tokenExpiryDate: { $gt: Date.now() } }, function(err, user) {
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/');
		}
		res.render('index', {
			title: 'New Password',
			pageClass: 'new_password',
			token: req.params.token
		});
	});
});

router.post('/reset/:token', function(req, res) {
	var msg = {};
	async.waterfall([
		function(done) {
			User.findOne({ token: req.params.token, tokenExpiryDate: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
					req.flash('error', 'Password reset token is invalid or has expired.');
					msg.invalidToken = req.flash('error');
					return res.send(msg);
				}
				if (req.body.password === req.body.passwordConfirm) {
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(req.body.password, salt, function(err, hash) {
							user.password = hash;
							user.token = undefined;
							user.tokenExpiryDate = undefined;
							user.save(function(err){
								done(err, user);
							});
						});
					});
				} else {
					req.flash("error", "Passwords do not match.");
					msg.noMatch = req.flash("error");
					return res.send(msg);
				}
			});
		},
		function(user, done) {
			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'nathanzenga@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: 'nathanzenga@mail.com',
				from: user.email,
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
				'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			transporter.sendMail(mailOptions, function(err) {
				if (err) return err;
				req.flash("success", "Your password has been changed! You can now sign in.");
				msg.success = req.flash("success");
				res.send(msg);
				done(err);
			});
		}
	], function(err) {
		if (err) return err;
	});
});

module.exports = router;