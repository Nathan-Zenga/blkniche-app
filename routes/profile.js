var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	mongoose = require('mongoose'),
	Grid = require('gridfs-stream'),
	User = require('../models/user'),
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

	User.find(function(err, docs){
		gfs.files.find().toArray((err, files) => {
			if (err) return err;

			var name = "i" + req.user._id.toString().slice(-5);

			var currentFile = () => {
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
				icon_src: currentFile()
			});
		});
	});

});

router.post('/u/upload/icon', (req, res, next) => {

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
router.delete('/u/remove/icon/:id', (req, res) => {
	gfs.remove({ _id: req.params.id, root: 'profile_icons' }, (err, gridStore) => {
		if (err) {
			return res.status(404).json({ err: err });
		}
		res.redirect(req.get('referer'));
	});
});



module.exports = router;