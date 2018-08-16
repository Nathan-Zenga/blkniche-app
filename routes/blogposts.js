var express = require('express'),
	router = express.Router(),
	auth = require('../config/config').ensureAuthenticated,
	Post = require('../models/post');

router.post('/', auth, (req, res) => {
	if (req.body.title || req.body.textbody) {
		if (req.body.tags) {
			var tags = req.body.tags.split(",");
			tags.forEach((tag, i) => { if (tag[0]==" ") tags[i] = tag.slice(1) });
		}

		var newPost = new Post({
			userId: req.user._id.toString(),
			title: req.body.title,
			textbody: req.body.textbody,
			tags: tags
		});

		newPost.save(err => { if (err) throw err });
	} else {
		req.flash('error', 'No content added');
	}
	res.redirect(req.get('referer'));
});

router.post('/delete', auth, (req, res) => {
	Post.remove({_id: req.body.id}, (err, result) => {
		if (err) return err;
		res.end();
	})
});

router.post('/update/:id', auth, (req, res) => {
	Post.findById(req.params.id, (err, post) => {
		if (err) return err;

		post.title = req.body.title || post.title;
		post.textbody = req.body.textbody || post.textbody;
		post.tags = req.body.tags || post.tags;
		post.save(err => {
			if (err) return err;
			res.redirect(req.get('referer'));
		})
	})
});

module.exports = router;