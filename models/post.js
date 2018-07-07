var mongoose = require('mongoose');

// User Schema
var PostSchema = mongoose.Schema({
	userId: String,
	title: String,
	textbody: String,
	tags: Array
}, {
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	},
	date: {
		type: String,
		required: false
	}
});

module.exports = mongoose.model('BlogPost', PostSchema);
