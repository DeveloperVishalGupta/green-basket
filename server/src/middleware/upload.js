import multer from 'multer';
import path from 'path';

/**
 * Multer configuration for handling file uploads
 * Stores files in memory for direct upload to Cloudinary
 */

// Configure multer to store files in memory
const storage = multer.memoryStorage();

/**
 * File filter to only allow image files
 * @param {Object} req - Express request object
 * @param {Object} file - Uploaded file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  // Check file extension
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

/**
 * Multer upload middleware
 * Limits: 3MB per file, max 5 files
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB per file
  },
  fileFilter: fileFilter,
});

/**
 * Upload multiple images (up to 5)
 */
const uploadProductImages = upload.array('images', 5);

/**
 * Upload single image
 */
const uploadSingleImage = upload.single('image');

/**
 * Handle multer errors
 * @param {Error} err - Multer error
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer upload error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 3MB per file.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
};

/**
 * Parse array fields from FormData
 * Converts fields ending with [] to proper arrays
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const parseArrayFields = (req, res, next) => {
  if (req.body) {
    // Handle fields with [] suffix (sent as multiple values with same key)
    Object.keys(req.body).forEach(key => {
      if (key.endsWith('[]')) {
        const actualKey = key.slice(0, -2); // Remove [] suffix
        const values = req.body[key];
        
        // If it's already an array, use it; if single value, wrap in array
        req.body[actualKey] = Array.isArray(values) ? values : [values];
        
        // Remove the original key with []
        delete req.body[key];
      }
    });
  }
  
  next();
};

export {
    handleUploadError,
    parseArrayFields, upload,
    uploadProductImages,
    uploadSingleImage
};

