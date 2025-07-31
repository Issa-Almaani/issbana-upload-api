
// api/upload.js
// هذا الملف يجب أن يكون داخل مجلد 'api' في جذر مشروعك

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ المسار '/' فقط لأن الملف يمثل /api/upload بالكامل
app.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('لم يتم رفع أي ملف.');
    }

    try {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).send('فشل الرفع إلى Cloudinary. تحقق من مفاتيح API.');
                }
                if (result && result.secure_url) {
                    res.send(result.secure_url);
                } else {
                    res.status(500).send('فشل في استلام رابط الملف من Cloudinary.');
                }
            }
        );
        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Server error during upload:', error);
        res.status(500).send('خطأ في الخادم أثناء الرفع.');
    }
});

app.get('/', (req, res) => {
    res.send('وظيفة رفع ملفات Cloudinary تعمل!');
});

module.exports = app;
