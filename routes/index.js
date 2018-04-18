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

module.exports = router;