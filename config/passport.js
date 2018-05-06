var LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcryptjs'),
	User = require('../models/user'),
	config = require('../config/config'),
	msg = 'Invalid username or password';

module.exports = function(passport) {
	passport.use(new LocalStrategy(function(username, password, done) {
		User.getUserByUsername(username, function(err, user) {
			if(err) throw err;
			if(!user){
				return done(null, false, {message: msg});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: msg});
				}
			});
		});
	}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.getUserById(id, function(err, user) {
			done(err, user);
		});
	});
}