// ==============================
// middleware/uploadMiddleware.js
// Handles file uploads safely:
// - Only allows PDF, PNG, JPG
// - Max file size: 5MB
// - Random filenames (prevents attacks & overwrites)
// ==============================

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// ---- STEP 1: Where to save files & what to name them ----
const storage = multer.diskStorage({

  // WHERE to save the file
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // saves into backend/uploads folder
  },

  // WHAT to name the file
  filename: (req, file, cb) => {
    // Generate a random string instead of using the original filename
    // Example: instead of "report.pdf", save as "a8f3c21b9e4d5f1a.pdf"
    const randomName = crypto.randomBytes(16).toString('hex');

    // Keep the original file extension (.pdf, .png, .jpg)
    const fileExtension = path.extname(file.originalname);

    // Combine them: a8f3c21b9e4d5f1a.pdf
    cb(null, randomName + fileExtension);
  }
});

// ---- STEP 2: Only allow specific file types ----
const fileFilter = (req, file, cb) => {

  // List of MIME types we allow
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];

  if (allowedTypes.includes(file.mimetype)) {
    // File type is safe — allow it
    cb(null, true);
  } else {
    // File type is NOT allowed — reject it
    cb(new Error('Invalid file type. Only PDF, PNG, and JPG files are allowed.'), false);
  }
};

// ---- STEP 3: Combine everything into the upload tool ----
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maximum file size
  }
});

module.exports = upload;