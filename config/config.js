const async = require("async");
const env = require('./env')();
module.exports = {
	db: env.db,
	ensureAuthenticated: (req, res, next) => {
		if(req.isAuthenticated()) {
			return next();
		} else {
			req.flash('error_msg','You are not logged in');
			res.redirect('/');
		}
	},
	clearance: (req, gfs, name, User, Post, cb) => {

		if (!name || typeof name == "undefined") {
			name = "i" + req.user._id.toString().slice(-5);
		}

		async.waterfall([
			function(done) { // Delete uploaded media
				gfs.files.find().toArray((err, files) => {
					if (files || files.length) {
						files.forEach(file => {

							// Check file exists
							if (file.filename.includes(name)) {
								var isJPG = file.contentType.includes("jpeg");
								var ext = isJPG ? ".jpg" : ".png";
								var filename = name + ext;
								// remove existing icon
								gfs.remove({ filename: filename, root: 'profile_icons' }, (err, gridStore) => {
									if (err) return cb(err);
								});
							}
						});
					}
					done(err, req.user._id.toString());
				});
			},
			function(id, done) { // Delete blog posts
				if (Post && Post != null) {
					Post.remove({userId: id}, (err, result) => {
						if (err) return cb(err);
					})
				}
				done();
			},
			function(done) { // Delete account
				if (User && User != null) {
					User.remove({ _id: req.user.id }, (err, result) => {
						if (err) return cb(err);
					})
				}
				done('done');
			}
		], cb())
	}
}
