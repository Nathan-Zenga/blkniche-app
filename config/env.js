const aws = require('aws-sdk');
let s3 = null;

require('dotenv').config()

module.exports = function() {
	s3 = new aws.S3({
		db: process.env.DB
	});

	const variables = {
		db: process.env.DB
	};

	return variables
}
