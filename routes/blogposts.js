var express = require('express'),
	router = express.Router(),
	Post = require('../models/post');

router.post('/', (req, res) => {
	if (req.body.title || req.body.textbody) {
		var newPost = new Post({
			userId: req.user._id.toString(),
			title: req.body.title,
			textbody: req.body.textbody
		});

		newPost.save((err, post) => {
			if(err) throw err;
			res.redirect(req.get('referer'));
		});
	} else {
		req.flash('error', 'No content added');
		res.redirect(req.get('referer'));
	}
});

router.post('/delete', (req, res) => {
	Post.remove({_id: req.body.id}, (err, result) => {
		if (err) return err;
		res.end();
	})
});

router.post('/update/:id', (req, res) => {
	Post.findById(req.params.id, (err, post) => {
		if (err) return err;

		post.title = req.body.title || post.title;
		post.textbody = req.body.textbody || post.textbody;
		post.save(err => {
			if (err) return err;
			res.redirect(req.get('referer'));
		})
	})
});

module.exports = router;