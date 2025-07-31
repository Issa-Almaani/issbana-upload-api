// api/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('لم يتم رفع أي ملف.');
    }

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).send('فشل الرفع إلى Cloudinary.');
            }
            res.send({ url: result.secure_url });
        }
    );
    stream.end(req.file.buffer);
});

module.exports = router;
