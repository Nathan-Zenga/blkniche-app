var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// create schema and model
var UserSchema = mongoose.Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String },
	DOB: { type: Date },
	nationality: { type: String },
	password: { type: String }
});

var Customer = module.exports = mongoose.model('Customer', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	Customer.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	Customer.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) throw err;
		callback(null, isMatch);
	});
}