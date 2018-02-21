var LocalStrategy = require('passport-local').Strategy,
	Customer = require('../models/customer'),
	config = require('../config/database'),
	bcrypt = require('bcrypt');

module.exports = function(passport) {
	passport.use(new LocalStrategy(
		function(username, password, done) {
			Customer.getUserByUsername(username, function(err, user){
				if(err) throw err;
				if(!user){
					return done(null, false, {message: 'Unknown user'});
				}

				Customer.comparePassword(password, user.password, function(err, isMatch){
					if(err) throw err;
					if(isMatch){
						return done(null, user);
					} else {
						return done(null, false, {message: 'Invalid password'});
					}
				});
			});
		}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		Customer.getUserById(id, function(err, user) {
			done(err, user);
		});
	});
}