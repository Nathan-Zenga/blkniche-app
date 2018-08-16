var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	mongoose = require('mongoose'),
	Grid = require('gridfs-stream'),
	User = require('../models/user'),
	Post = require('../models/post'),
	auth = require('../config/config').ensureAuthenticated,
	upload = require('../config/upload');

let conn = mongoose.connection;
let gfs; // init gfs

// Check connection
conn.once('open', function() {
	// init stream
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('profile_icons');
});

router.get('/', auth, function(req, res){

	gfs.files.find().toArray((err, files) => {
		if (err) return err;
		Post.find({userId: req.user._id}).sort({created_at: -1}).exec((err, posts) => {
			if (err) return err;

			var name = "i" + req.user._id.toString().slice(-5);

			currentIcon = () => {
				var result;
				// Check if there are files
				if (files || files.length) {
					files.forEach(file => {
						// Check file exists
						if (file.filename.includes(name)) {
							result = file
						}
					});
				}
				return result
			};

			res.render('profile', {
				title: 'Profile',
				pageClass: 'profile',
				icon_src: currentIcon(),
				posts: posts,
				timelength: (timestamp) => {
					const second = 1000;
					const minute = second * 60;
					const hour = minute * 60;
					const day = hour * 24;
					const week = day * 7;
					const month = day * 30;
					const year = month * 12;
					var time_diff = Date.now() - timestamp;
					var length = "Just now";

					if (time_diff > second) {
						length = Math.floor(time_diff / second) + " seconds ago";
						if (Math.floor(time_diff / second) <= 1) length = length.replace("s ago", " ago");
					}
					if (time_diff > minute) {
						length = Math.floor(time_diff / minute) + " minutes ago";
						if (Math.floor(time_diff / minute) <= 1) length = length.replace("s ago", " ago");
					}
					if (time_diff > hour) {
						length = Math.floor(time_diff / hour) + " hours ago";
						if (Math.floor(time_diff / hour) <= 1) length = length.replace("s ago", " ago");
					}
					if (time_diff > day) {
						length = Math.floor(time_diff / day) + " days ago";
						if (Math.floor(time_diff / day) <= 1) length = length.replace("s ago", " ago");
					}
					if (time_diff > week) {
						length = Math.floor(time_diff / week) + " weeks ago";
						if (Math.floor(time_diff / week) <= 1) length = length.replace("s ago", " ago");
					}
					if (time_diff > month) {
						length = Math.floor(time_diff / month) + " months ago";
						if (Math.floor(time_diff / month) <= 1) length = length.replace("s ago", " ago");
					}
					if (time_diff > year) {
						length = Math.floor(time_diff / year) + " years ago";
						if (Math.floor(time_diff / year) <= 1) length = length.replace("s ago", " ago");
					}

					return length
				}
			});
		});
	});

});

router.post('/u/upload/icon', auth, (req, res, next) => {

	var icon = upload.single('icon'); // field name

	// new upload process
	User.find(function(err, docs) {
		if (err) return err;
		icon(req, res, (err) => {
			if (err) {
				req.flash('error_msg', `${err}`);
			} else if (req.file == undefined) {
				req.flash('error_msg','No file selected!');
			}
			res.redirect(req.get('referer'));
		});
	});
});

// Display profile icon
router.get('/u/:filename', (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		// Check if file
		if (!file || file.length === 0) {
			return res.status(404).json({
				err: 'Icon does not exist'
			});
		}

		// Check if image
		if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
			// Read output to browser
			const readstream = gfs.createReadStream(file.filename);
			readstream.pipe(res);
		} else {
			res.status(404).json({
				err: 'Not an image'
			});
		}
	});
});

// Delete profile icon process
router.delete('/u/remove/icon/:id', auth, (req, res) => {
	gfs.remove({ _id: req.params.id, root: 'profile_icons' }, (err, gridStore) => {
		if (err) {
			return res.status(404).json({ err: err });
		}
		res.redirect(req.get('referer'));
	});
});



module.exports = router;
