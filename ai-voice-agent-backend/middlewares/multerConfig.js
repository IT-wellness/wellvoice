import multer from 'multer';              // Middleware for handling multipart/form-data (file uploads)
import path from 'path';                  // Node.js module for handling file extensions and paths
import { v4 as uuidv4 } from 'uuid';      // Generates unique identifiers for file names
import fs from 'fs';                      // For checking if upload directory exists

const UPLOAD_DIR = './uploads';
const MAX_FILE_SIZE_MB = 10;

/**
 * Ensure the uploads directory exists, or create it.
 */
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * - Sets destination folder
 * - Customizes filename using UUID and original extension
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter for audio-only uploads.
 * Rejects any file that doesn't match audio MIME types.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('❌ Invalid file type. Only audio files are allowed.'), false);
  }
};

/**
 * Final Multer configuration
 * - Applies custom storage, filter, and size limit
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // 10 MB
  },
});

export default upload;