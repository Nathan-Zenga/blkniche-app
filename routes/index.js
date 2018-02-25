var express = require('express'),
	router = express.Router(),
	User = require('../models/user');

// Get Homepage
router.get('/', function(req, res){
	res.render('index', {
		title: 'Home',
		pageClass: 'index'
	});
});

router.get('/profile', ensureAuthenticated, function(req, res){
	User.find(function(err, docs){
		res.render('profile', {
			title: 'Profile',
			pageClass: 'profile',
			customers: docs
		});
	});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/');
	}
}


module.exports = router;