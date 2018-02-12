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

const Model = mongoose.model('Customer', CustomerSchema);

module.exports = Model;