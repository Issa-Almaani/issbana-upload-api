const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// إعداد التخزين
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// نقطة رفع الملفات عبر المتصفح (اختياري)
app.get('/', (req, res) => {
  res.send(`
    <h1>رفع ملف للسيرفر</h1>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">ارفع الملف</button>
    </form>
  `);
});

// نقطة رفع الملفات API
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف!' });
  }

  // الرابط الكامل للملف المرفوع
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  res.json({
    message: 'تم رفع الملف بنجاح',
    fileUrl: fileUrl
  });
});

// عرض الملفات المرفوعة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ استمع على جميع الشبكات (0.0.0.0) لتعمل من المحاكي أو الهاتف
const PORT = 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ IssBana Server running on http://${HOST}:${PORT}`);
});
