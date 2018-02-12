const LocalStrategy = require('passport-local').Strategy,
	  Customer = require('../models/customer'),
	  config = require('../config/database'),
	  bcrypt = require('bcrypt');

module.exports = function(passport) {
	passport.use(new LocalStrategy(function(email, password, done){
		
		// match email
		let query = {email: email};
		Customer.findOne(query, function(err, user){
			if (err) {
				throw err
			}
			if (!user) {
				return done(null, false, {message: 'User does not exist.'});
			}

			// match password
			bcrypt.compare(password, user.password, function(err, isMatch){
				if (err) {
					throw err
				}
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {message: 'Wrong password.'});
				}
			});
		});
	}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		Customer.findById(id, function(err, user) {
			done(err, user);
		})
	});
}