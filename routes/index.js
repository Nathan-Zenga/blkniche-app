var express = require('express'),
	router = express.Router(),
	bcrypt = require('bcrypt'),
	passport = require('passport');


// Load index page, with data passing in
router.get('/', function(req, res) {
	// render the page, with data passed into templates
	res.render('index', {
		title: 'Home',
		pageName: 'index'
	});
});

// Logout
// router.get('/logout', function(req, res){
// 	req.logout();
// 	req.flash('success', 'You are logged out');
// 	res.redirect('/users/login');
// });


module.exports = router;