// import modules
var express = require('express'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	path = require('path'), // core module
	ejs = require('ejs'),
	expressValidator = require('express-validator'),
	flash = require('connect-flash'),
	session = require('express-session'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	methodOverride = require('method-override'),
	config = require('./config/config'),
	env = require('./config/env')();

mongoose.connect(env.db);
let conn = mongoose.connection;

// Check connection
conn.once('open', function() {
	console.log('Connected to db');
});
// Check for DB errors
conn.on('error', function(err) { console.log(err); });

// Initialise express app
var app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator());

// Connect Flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.login_error = req.flash('login_error');
	res.locals.login_error_chars = req.flash('login_error_chars');
	res.locals.update_error = req.flash('update_error');
	res.locals.user = req.user || null;
	next();
});

// prepare routes
app.use('/', require('./routes/index'));
app.use('/profile', require('./routes/profile'));
app.use('/users', require('./routes/users'));
app.use('/account', require('./routes/forgot'));
app.use('/mail', require('./routes/mail'));
app.use('/blog/post', require('./routes/blogposts'));

// Set port + listen for requests
app.set('port', (process.env.PORT || 5111));
var server = app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

// exporting for testing purposes
module.exports.port = app.get('port');
module.exports.closeServer = () => {
	server.close();
}
