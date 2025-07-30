// server.js
const express = require('express');
const cors = require('cors');
const uploadRouter = require('./api/upload'); // استيراد الراوتر من upload.js

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/upload', uploadRouter); // المسار الذي يستخدمه تطبيق الجوال

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
