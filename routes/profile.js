var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	User = require('../models/user'),
	ensureAuthenticated = require('../config/config').ensureAuthenticated,
	upload = require('../config/upload');

router.get('/', ensureAuthenticated, function(req, res){
	User.find(function(err, docs){
		res.render('profile', {
			title: 'Profile',
			pageClass: 'profile',
			customers: docs,
			dp_src: () => {
				let filename = 'public/u/i' + req.user._id.toString().slice(-5);
				let jpg = fs.existsSync(filename + '.jpg');
				let jpeg = fs.existsSync(filename + '.jpeg');

				let ext = jpg ? '.jpg' : jpeg ? '.jpeg' : '.png';

				let file = filename + ext;
				let img = fs.existsSync(file) ? '/u/i' + req.user._id.toString().slice(-5) + ext : '/img/default.png';
				return img
			}
		});
	});
});

router.post('/upload/dp', (req, res) => {

	var dp = upload.single('dp'); // field name

	User.find(function(err, docs){
		if (err) return err;
		dp(req, res, (err) => {
			if(err){
				req.flash('error_msg', `${err}`);
				res.redirect(req.get('referer'));
			} else {
				if(req.file == undefined){
					req.flash('error_msg','No file selected!');
					res.redirect(req.get('referer'));
				} else {
					res.redirect(req.get('referer'));
				}
			}
		});
	});
});

router.get('/delete/dp', (req, res) => {
	let filename = 'public/u/i' + req.user._id.toString().slice(-5);
	let jpg = fs.existsSync(filename + '.jpg');
	let jpeg = fs.existsSync(filename + '.jpeg');
	let ext = jpg ? '.jpg' : jpeg ? '.jpeg' : '.png';
	let file = filename + ext;
	if (fs.existsSync(file)) {
		fs.unlink(file, (err) => {
			if (err) return err;
		});
		req.flash('success_msg','Profile picture deleted!');
	}
	res.redirect('/profile')
});


module.exports = router;