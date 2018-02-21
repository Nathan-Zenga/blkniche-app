var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// create schema and modal
const CustomerSchema = new Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String },
	DOB: { type: Date },
	nationality: { type: String },
	password: { type: String }
});

var Customer = module.exports = mongoose.model('Customer', CustomerSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
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