var express = require('express'),
	router = express.Router(),
	fs = require('fs'),
	nodemailer = require('nodemailer'),
	config = JSON.parse(fs.readFileSync('config/config.json'));

router.post('/send', function(req, res) {

	let transporter = nodemailer.createTransport({
		service: 'gmail',
		port: 465,
		secure: true,
		auth: {
			user: 'nathanzenga@gmail.com',
			pass: config.password
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
	});

	res.redirect(req.get('referer'));

});

module.exports = router;