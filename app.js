// import modules
var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	mongoose = require('mongoose'),
	expressValidator = require('express-validator'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	session = require('express-session'),
	flash = require('connect-flash'),
	config = require('./config/database'),
	FACTORIAL = path.join(__dirname, 'build', 'factorial.min.js');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function() { console.log('Connected to db'); });
// Check for DB errors
db.on('error', function(err) { console.log(err); });

// initialise express
var app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// set static path (joined with 'views')
app.use(express.static(__dirname + '/public'));

// Express Session Middleware
app.use(session({
	secret: 'test secret',
	resave: true,
	saveUninitialized: true
}));

// connect flash
app.use(flash());

// Passport config + initializing (middleware)
// require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global variables (in middleware)
app.use( function(req, res, next) {
	res.locals.db = null;
	res.locals.ObjectId = null;
	res.locals.errors = null;
	// res.locals.messages = require('express-messages')(req, res);
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.customer = req.customer || null;
	next();
});

// Express Validator middleware
app.use(expressValidator());

// preparing routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/profile', require('./routes/profile'));
app.use('/mail', require('./routes/mail'));

// listen for requests on specified port
var port = process.env.PORT || 5111;
app.listen(port, function() {
	console.log(`Good to go on port ${port}`);
});