const request = require("request");
const assert = require("chai").assert;
const mongoose = require('mongoose');
const app = require("../app.js");
const User = require("../models/user");

var base_url = "http://localhost:"+ app.port +"/";

// let conn = mongoose.connection;

// conn.once('open', function() {
// 	console.log('Connected to db');
// });

describe("App", function() {
	describe("testing server connectivity", function() {
		// it("returns status code 200", function(done) {

		// 	request.get(base_url, function(error, response, body) {
		// 		try {
		// 			assert.equal(200, response.statusCode);
		// 			app.closeServer();
		// 			done();
		// 		} catch(err){
		// 			console.log(err.message)
		// 		}
		// 	});

		// });

		it("check if server is connected to database", function(done) {

			request.get(base_url, function(error, response, body) {
				try {
					User.find((err, docs) => {
						assert.equal("object", typeof docs);
						app.closeServer();
						done();
					})
				} catch(err) {
					console.log(err.message)
				}
			});

		});

		it("check field", function(done) {

			request.get(base_url, function(error, response, body) {
				try {
					User.find((err, docs) => {
						assert.notTypeOf(docs[0].nationality, "undefined");
						app.closeServer();
						done();
					})
				} catch(err) {
					console.log(err.message)
				}
			});

		});
	});
});