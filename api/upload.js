// api/upload.js
// هذا الملف يجب أن يكون داخل مجلد 'api' في جذر مشروعك

// استيراد المكتبات المطلوبة
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
// استخدام dotenv لتحميل المتغيرات البيئية من ملف .env للاختبار المحلي.
// عند النشر على Vercel، سيتم استخدام المتغيرات التي تحددها في إعدادات Vercel مباشرة.
require('dotenv').config();

// إنشاء تطبيق Express
const app = express();

// تمكين CORS للسماح لطلبات تطبيق أندرويد بالوصول إلى الخادم
// في بيئة الإنتاج، قد ترغب في تحديد نطاقات معينة بدلاً من السماح للجميع
app.use(cors());

// تهيئة Cloudinary بمعلومات حسابك من المتغيرات البيئية
// هذه المتغيرات (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
// ستقوم بإعدادها في لوحة تحكم Vercel
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// إعداد Multer لتخزين الملفات مؤقتًا في الذاكرة قبل الرفع إلى Cloudinary
// هذا ضروري لوظائف Serverless حيث لا يوجد نظام ملفات دائم
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// نقطة نهاية (Endpoint) لرفع الملفات
// هذا المسار '/upload' سيتم الوصول إليه عبر الرابط العام لـ Vercel متبوعًا بـ '/api/upload'
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('لم يتم رفع أي ملف.');
    }

    try {
        // رفع الملف إلى Cloudinary باستخدام stream
        // resource_type: "auto" يسمح لـ Cloudinary بتحديد نوع الملف (صورة، فيديو، صوت) تلقائيًا
        const result = await cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    // إرجاع رسالة خطأ واضحة
                    return res.status(500).send('فشل الرفع إلى Cloudinary. تحقق من مفاتيح API.');
                }
                if (result && result.secure_url) {
                    // إرجاع رابط URL الآمن للملف المرفوع
                    res.send(result.secure_url);
                } else {
                    // في حال لم يتم استلام رابط URL آمن
                    res.status(500).send('فشل في استلام رابط الملف من Cloudinary.');
                }
            }
        ).end(req.file.buffer); // تمرير بيانات الملف (buffer) إلى Cloudinary

    } catch (error) {
        console.error('Server error during upload:', error);
        // التعامل مع أي أخطاء غير متوقعة
        res.status(500).send('خطأ في الخادم أثناء الرفع.');
    }
});

// نقطة نهاية بسيطة للتحقق من أن الوظيفة تعمل (اختياري، ولكن مفيد)
// هذا المسار '/' سيتم الوصول إليه عبر الرابط العام لـ Vercel متبوعًا بـ '/api'
app.get('/', (req, res) => {
    res.send('وظيفة رفع ملفات Cloudinary تعمل!');
});

// تصدير تطبيق Express كـ Serverless Function
// هذا السطر ضروري لكي يتمكن Vercel من التعرف على وظيفتك وتشغيلها
module.exports = app;