module.exports = {
	db: 'mongodb://nathanzen:thomas96@ds251737.mlab.com:51737/blacknichedb',
	secret: 'testsecret1',
	ensureAuthenticated: (req, res, next) => {
		if(req.isAuthenticated()) {
			return next();
		} else {
			req.flash('error_msg','You are not logged in');
			res.redirect('/');
		}
	},
	gfsRemove: (req, res, gfs, name, User) => {

		var removeUser = () => {
			if (User || typeof User != "undefined") {
				// Delete account
				User.remove({
					_id: req.user.id
				}, function(err, result) {
					if (err) { 
						return console.log(err);
					}
				});
			}
		};

		if (!name || typeof name == "undefined") {
			name = "i" + req.user._id.toString().slice(-5);
		}
		
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
							if (err) {
								return res.status(404).json({ err: err });
							}
							removeUser();
						});
					} else {
						removeUser();
					}
				});
			} else {
				removeUser();
			}
			if (res && User) {
				req.flash('success_msg', 'Account successfully deleted');
				res.redirect('/');
			}
		});
	}
}