var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// create schema
const CustomerSchema = new Schema({
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String },
	DOB: { type: Date },
	nationality: { type: String },
	password: { type: String }
});

// create model
const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;