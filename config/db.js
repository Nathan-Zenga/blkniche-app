var fs = require('fs'),
	express = require('express'),
	config = JSON.parse(fs.readFileSync('config/config.json'));

module.exports = {
	database: config.db,
	secret: 'testsecret1'
}