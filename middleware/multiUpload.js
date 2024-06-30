const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed."
      )
    );
  }
};

const multiUpload = multer({
  storage,
  fileFilter,
});

module.exports = multiUpload;
