// ==============================
// middleware/uploadMiddleware.js
// Handles file upload validation:
// - Only allows PDF, PNG, JPG
// - Max file size: 5MB
// - Uses MEMORY storage (file held in memory)
// - Then sent to Supabase Storage by the controller
// ==============================

const multer = require('multer');
const path = require('path');

// ---- STORAGE: Memory (not disk anymore!) ----
// Instead of saving to uploads/ folder,
// the file is held in memory (req.file.buffer)
// so we can send it directly to Supabase
const storage = multer.memoryStorage();

// ---- FILE TYPE FILTER ----
const fileFilter = (req, file, cb) => {

  // Check by MIME type
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/octet-stream' // Windows sometimes sends this
  ];

  // Check by file extension as backup
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error(
      'Invalid file type. Only PDF, PNG, and JPG files are allowed.'
    ), false); // reject the file
  }
};

// ---- COMBINE EVERYTHING ----
const upload = multer({
  storage: storage,        // memory storage
  fileFilter: fileFilter,  // type checking
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

module.exports = upload;