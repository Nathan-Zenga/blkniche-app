// import modules
var express = require('express'),
	bodyParser = require('body-parser'),
	http = require('http'), // core module
	path = require('path'), // core module
	expressValidator = require('express-validator'),
	mongojs = require('mongojs'),
	mongoose = require('mongoose'),
	passport = require('passport');
var FACTORIAL = path.join(__dirname, 'build', 'factorial.min.js');

// initialise express
var app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables (in middleware)
app.use( function(req, res, next) {
	res.locals.db = null;
	res.locals.ObjectId = null;
	res.locals.errors = null;
	next();
});

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Express Validator middleware
app.use(expressValidator());

// Passport config
require('./config/passport')(passport);

// Initialize Passport (middleware)
app.use(passport.initialize());
app.use(passport.session());

// set static path (joined with 'views')
app.use(express.static(__dirname + '/public'));

// preparing routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/profile', require('./routes/profile'));
app.use('/mail', require('./routes/mail'));


// listen for requests on specified port
app.listen(process.env.PORT || 5111, function() {
	console.log(`Good to go on port ${process.env.PORT || 5111}`);
});