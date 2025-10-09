const multer = require('multer');

// Храним файлы в памяти, чтобы сразу отправлять их в Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Для одного файла: upload.single('image')
// Для нескольких файлов: upload.array('images', 10) // максимум 10 файлов
module.exports = upload;
