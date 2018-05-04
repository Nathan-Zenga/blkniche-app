const multer = require('multer');
const path = require('path');
const config = require('./config');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');

// Set The Storage Engine
const storage = new GridFsStorage({
	url: config.db,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				} else if (typeof req.user === "undefined") {
					return console.error("req.user is undefined");
				}
				const filename = "i" + req.user._id.toString().slice(-5) + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: 'profile_icons'
				};
				resolve(fileInfo);
			});
		});
	}
});

// Init Upload
const upload = multer({
	storage: storage,
	limits:{fileSize: 1000000},
	fileFilter: function(req, file, cb){
		checkFileType(file, cb);
	}
});

// Check File Type
function checkFileType(file, cb){
	// Allowed ext
	const filetypes = /jpeg|jpg|png/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null,true)
	} else {
		cb('Error: Images Only!')
	}
}

module.exports = upload;