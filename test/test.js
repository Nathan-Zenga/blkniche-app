const request = require("request");
const assert = require("chai").assert;
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const app = require("../app.js");
const User = require("../models/user");

var base_url = "http://localhost:"+ app.port +"/";

let conn = mongoose.connection;
conn.once('open', function() {
	// init stream
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('profile_icons');
});

describe("App", function() {
	describe("testing server connectivity", function() {

		it("ensure no authentication", function(done) {

			request.get(base_url + "profile", function(error, response, body) {
				assert.equal(false, response.body.includes('class="profile page"'));
				app.closeServer();
				done();
			});

		});

		it("server connection to database", function(done) {

			request.get(base_url, function(error, response, body) {
				User.find((err, docs) => {
					assert.equal("object", typeof docs);
					app.closeServer();
					done();
				})
			});

		});

		it("check field existence", function(done) {

			request.get(base_url, function(error, response, body) {
				User.find((err, docs) => {
					assert.notTypeOf(docs[0].nationality, "undefined");
					app.closeServer();
					done();
				})
			});

		});

		it("GFS: check file existence by name search", function(done) {
			var exists = false;
			gfs.files.find().toArray((err, files) => {
				if (files || files.length) {
					files.forEach(file => {
						if (file.filename.includes("test")) {
							exists = true
						}
					});
					assert.notEqual(true, exists);
					done();
				}
			});
		});

	});
});