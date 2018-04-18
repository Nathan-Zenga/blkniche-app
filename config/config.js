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
	}
}