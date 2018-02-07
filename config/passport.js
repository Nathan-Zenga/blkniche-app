const LocalStrategy = require('passport-local').Strategy,
	  Customer = require('../models/customer'),
	  config = require('../config/database'),
	  bcrypt = require('bcrypt');

module.exports = function(passport) {
	passport.use(new LocalStrategy(function(email, password, done){
		
		// match email
		let query = {email: email};
		Customer.findOne(query, function(err, customer){
			if (err) {
				throw err
			}
			if (!customer) {
				console.log('User does not exist');
				return done(null, false, {message: 'User does not exist.'});
			}

			// match password
			bcrypt.compare(password, customer.password, function(err, isMatch){
				if (err) {
					throw err
				}
				if (!isMatch) {
					console.log('Wrong password');
					return done(null, false, {message: 'Wrong password.'});
				}
				return done(null, customer);
			});
		});
	}));

	passport.serializeUser(function(customer, done) {
		done(null, customer.id);
	});

	passport.deserializeUser(function(id, done) {
		Customer.findById(id, function(err, customer) {
			done(err, customer);
		})
	});
}