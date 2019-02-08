var express = require('express'),
	router = express.Router(),
	nodemailer = require('nodemailer'),
	config = require('../config/config'),
	auth = config.ensureAuthenticated;

router.post('/send', auth, function(req, res) {

	let transporter = nodemailer.createTransport({
		service: 'gmail',
		port: 465,
		secure: true,
		auth: {
			user: 'nznodemailer@gmail.com',
			pass: 'nodemailer246'
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	let mailOptions = {
		from: `"${req.body.name}" <${req.body.email}`,
		to: 'nathanzenga@gmail.com',
		subject: req.body.subject,
		text: req.body.message
	};


	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			return console.log(error);
		}
		console.log("The message was sent!");
		console.log(info);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	});

	res.redirect(req.get('referer'));

});

module.exports = router;