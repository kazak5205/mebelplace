const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папку для загрузок, если её нет
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[0];
    let subDir = '';

    switch (fileType) {
      case 'image':
        subDir = 'images';
        break;
      case 'video':
        subDir = 'videos';
        break;
      case 'audio':
        subDir = 'audio';
        break;
      default:
        subDir = 'files';
    }

    const targetDir = path.join(uploadDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'video/mp4': true,
    'video/webm': true,
    'video/quicktime': true,
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/ogg': true,
    'audio/webm': true,
    'application/pdf': true,
    'text/plain': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'), false);
  }
};

// Настройка multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  }
});

// Middleware для обработки ошибок загрузки
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Файл слишком большой. Максимальный размер: 50MB',
        timestamp: new Date().toISOString()
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Слишком много файлов. Максимум: 1 файл',
        timestamp: new Date().toISOString()
      });
    }
  }

  if (error.message === 'Неподдерживаемый тип файла') {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Неподдерживаемый тип файла',
      timestamp: new Date().toISOString()
    });
  }

  next(error);
};

module.exports = {
  single: upload.single('file'),
  array: upload.array('files'),
  fields: upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'avatar', maxCount: 1 }
  ]),
  handleUploadError
};
