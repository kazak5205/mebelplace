const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    '/app/uploads/videos',
    '/app/uploads/thumbnails',
    '/app/uploads/avatars',
    '/app/uploads/order-photos',
    '/app/uploads/chat-files'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// Video upload configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/app/uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

// Image upload configuration
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '/app/uploads/';
    
    // Determine upload path based on route or URL path
    const routePath = req.route?.path || '';
    const urlPath = req.url || '';
    const fullPath = req.originalUrl || '';
    const fieldName = file.fieldname || '';
    
    console.log('🔍 Upload destination check:', { routePath, urlPath, fullPath, fieldName });
    
    if (fieldName === 'avatar' || routePath.includes('avatar') || urlPath.includes('avatar') || fullPath.includes('avatar') || fullPath.includes('/profile')) {
      uploadPath += 'avatars/';
    } else if (routePath.includes('order') || urlPath.includes('order') || fullPath.includes('order')) {
      uploadPath += 'order-photos/';
    } else if (routePath.includes('chat') || urlPath.includes('chat') || fullPath.includes('chat')) {
      uploadPath += 'chat-files/';
    } else {
      uploadPath += 'images/';
    }
    
    console.log('✅ Upload path:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = 'img-' + uniqueSuffix + ext;
    console.log('✅ Filename:', filename);
    cb(null, filename);
  }
});

// File filter for videos
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for general files (images, videos, documents)
const generalFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed!'), false);
  }
};

// Multer configurations
const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB for videos
  },
  fileFilter: videoFilter
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB for high-quality images
  },
  fileFilter: imageFilter
});

const generalFileUpload = multer({
  storage: imageStorage, // Using image storage for now
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for general files
  },
  fileFilter: generalFileFilter
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        timestamp: new Date().toISOString()
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  if (error.message.includes('Only video files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only video files are allowed',
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed',
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.message.includes('File type not allowed')) {
    return res.status(400).json({
      success: false,
      message: 'File type not allowed',
      timestamp: new Date().toISOString()
    });
  }

  next(error);
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ File deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting file ${filePath}:`, error);
  }
};

// Utility function to get file URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // Convert backslashes to forward slashes for URLs
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Remove '/app/uploads/' prefix and add leading slash
  if (normalizedPath.startsWith('/app/uploads/')) {
    return normalizedPath.replace('/app/uploads/', '/uploads/');
  }
  
  return normalizedPath;
};

// Utility function to get file size in human readable format
const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  videoUpload,
  imageUpload,
  generalFileUpload,
  handleUploadError,
  deleteFile,
  getFileUrl,
  getFileSize,
  ensureUploadDirs
};

