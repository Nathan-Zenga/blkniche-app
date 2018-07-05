var express = require('express'),
	router = express.Router(),
	Post = require('../models/post');

router.post('/', function(req, res) {
	var newPost = new Post({
		userId: req.user._id.toString(),
		title: req.body.title,
		textbody: req.body.textbody
	});

	console.log(newPost);
	console.log();

	newPost.save((err, post) => {
		if(err) throw err;
		console.log(post);
		res.redirect(req.get('referer'));
	});
});

router.delete('/delete/:id', function(req, res) {
	Post.remove({_id: req.params.id}, (err, result) => {
		if (err) return err;
		res.redirect(req.get('referer'));
	})
});

module.exports = router;